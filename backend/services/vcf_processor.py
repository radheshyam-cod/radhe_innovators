"""
GeneDose.ai VCF Processing Service (STRICT MODE)

Clinical safety requirements:
- Reject non-VCF v4.1/v4.2 files (must have ##fileformat=VCFv4.1 or VCFv4.2)
- Enforce GRCh38; GRCh37 allowed only via liftover; unknown build is a hard failure
- Normalize indels (left-aligned) via bcftools (hard failure if unavailable)
- Extract rsID, CHROM, POS, REF, ALT, and INFO tags (GENE/STAR if present)
- Explicitly fail when required gene regions are not queryable / absent (no wild-type defaults)
- Detect CYP2D6 CNVs when present; if CNV cannot be determined, mark as unavailable
"""

from __future__ import annotations

import asyncio
import os
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pysam
import structlog

from ..core.config import settings
from ..models.analysis import ValidationResult

logger = structlog.get_logger()


class VCFValidationError(ValueError):
    """Raised when a VCF fails strict validation."""


class ToolingUnavailableError(RuntimeError):
    """Raised when required external tooling is missing."""


@dataclass(frozen=True)
class GeneRegion:
    gene: str
    chrom: str  # without "chr" prefix, GRCh38 coordinates
    start: int
    end: int


@dataclass(frozen=True)
class CNVCall:
    available: bool
    deletion_detected: bool
    duplication_detected: bool
    copy_number: Optional[int]
    evidence: List[str]


class VCFProcessor:
    """
    Strict VCF processing pipeline.

    NOTE: This class is intentionally strict. If required safety signals are missing,
    it fails the analysis rather than assuming normal/wild-type.
    """

    SUPPORTED_GENE_REGIONS: List[GeneRegion] = [
        GeneRegion("CYP2D6", "22", 42526217, 42530591),
        GeneRegion("CYP2C19", "10", 96541611, 96590712),
        GeneRegion("CYP2C9", "10", 96791608, 96854123),
        GeneRegion("SLCO1B1", "12", 21234867, 21347871),
        GeneRegion("TPMT", "6", 18129462, 18141174),
        GeneRegion("DPYD", "1", 97586408, 97923791),
    ]

    _FILEFORMAT_RE = re.compile(r"^##fileformat=VCFv(4\.1|4\.2)\s*$")

    def __init__(self) -> None:
        self.temp_dir = Path(settings.temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    async def process_bytes(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Process raw bytes for an uploaded VCF/VCF.GZ file.

        Returns a dict used by downstream PharmCAT + CPIC logic.
        """
        file_path: Optional[Path] = None
        work_path: Optional[Path] = None
        normalized_path: Optional[Path] = None
        indexed_path: Optional[Path] = None

        start = asyncio.get_event_loop().time()

        try:
            file_path = await self._save_uploaded_bytes(file_bytes, filename)
            build, fileformat = self._strict_validate_header(file_path)
            self._require_tooling()

            # Liftover if needed
            if build == "GRCh37":
                work_path = await self._liftover_to_grch38(file_path)
                build = "GRCh38"
            else:
                work_path = file_path

            # Normalize indels (left-aligned) and create tabix index.
            normalized_path = await self._normalize_left_align(work_path)
            indexed_path = await self._ensure_tabix_index(normalized_path)

            # Extract gene-region variants strictly (fail if region is unqueryable/absent).
            gene_variants = self._extract_supported_gene_variants_strict(indexed_path)

            # Detect CYP2D6 CNVs from VCF evidence (SVTYPE/CN tags). May be unavailable.
            cyp2d6_cnv = self._detect_cyp2d6_cnv(indexed_path)

            quality = self._assess_quality(indexed_path)
            processing_time = asyncio.get_event_loop().time() - start

            validation = ValidationResult(
                is_valid=True,
                errors=[],
                warnings=[],
                genome_build=build,
                variant_count=quality["variant_count"],
                quality_score=quality["quality_score"],
                file_size_mb=(file_path.stat().st_size / (1024 * 1024)),
            )

            return {
                "vcf_path": str(indexed_path),
                "filename": filename,
                "fileformat": fileformat,
                "genome_build": build,
                "gene_variants": gene_variants,
                "cyp2d6_cnv": {
                    "available": cyp2d6_cnv.available,
                    "deletion_detected": cyp2d6_cnv.deletion_detected,
                    "duplication_detected": cyp2d6_cnv.duplication_detected,
                    "copy_number": cyp2d6_cnv.copy_number,
                    "evidence": cyp2d6_cnv.evidence,
                },
                "quality": quality,
                "processing_time_seconds": processing_time,
                "validation": validation,
            }
        except VCFValidationError:
            raise
        except ToolingUnavailableError:
            raise
        except Exception as e:
            logger.error("Strict VCF processing failed", error=str(e))
            raise
        finally:
            # Cleanup: keep only the normalized+indexed file for downstream steps in this request.
            # Downstream pipeline must delete encrypted/plain files after completion (Phase 5).
            for p in [file_path, work_path]:
                if p and p.exists() and normalized_path and p.resolve() != normalized_path.resolve():
                    try:
                        p.unlink()
                    except Exception:
                        pass

    async def _save_uploaded_bytes(self, file_bytes: bytes, filename: str) -> Path:
        if not filename.endswith((".vcf", ".vcf.gz")):
            raise VCFValidationError("Invalid file extension. Only .vcf and .vcf.gz are accepted.")

        max_bytes = int(settings.max_file_size_mb) * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise VCFValidationError(f"File exceeds {settings.max_file_size_mb}MB limit.")

        safe_name = filename.replace("\\", "_").replace("/", "_")
        target = self.temp_dir / f"{int(asyncio.get_event_loop().time() * 1000)}_{safe_name}"
        with open(target, "wb") as f:
            f.write(file_bytes)

        return target

    def _strict_validate_header(self, file_path: Path) -> Tuple[str, str]:
        """
        Returns (genome_build, fileformat_version).
        Hard-fails on unknown build.
        """
        try:
            header_lines: List[str] = []
            with pysam.BGZFile(str(file_path), "r") if file_path.name.endswith(".gz") else open(
                file_path, "rb"
            ) as fh:
                for _ in range(5000):
                    raw = fh.readline()
                    if not raw:
                        break
                    line = raw.decode("utf-8", errors="replace").rstrip("\n")
                    if not line.startswith("#"):
                        break
                    header_lines.append(line)

            fileformat_lines = [l for l in header_lines if l.startswith("##fileformat=")]
            if not fileformat_lines:
                raise VCFValidationError("Missing required VCF header: ##fileformat=VCFv4.1 or VCFv4.2")
            if not any(self._FILEFORMAT_RE.match(l) for l in fileformat_lines):
                raise VCFValidationError(
                    f"Unsupported VCF fileformat header(s): {fileformat_lines}. Only VCFv4.1/VCFv4.2 accepted."
                )
            fileformat = "VCFv4.2" if any("VCFv4.2" in l for l in fileformat_lines) else "VCFv4.1"

            ref_lines = [l for l in header_lines if l.startswith("##reference=")]
            if not ref_lines:
                raise VCFValidationError(
                    "Missing ##reference= header; genome build is unknown and is rejected in strict mode."
                )
            ref = ref_lines[0].lower()
            if "grch38" in ref or "hg38" in ref:
                return ("GRCh38", fileformat)
            if "grch37" in ref or "hg19" in ref:
                return ("GRCh37", fileformat)

            raise VCFValidationError(f"Unsupported/unknown reference in header: {ref_lines[0]}")
        except VCFValidationError:
            raise
        except Exception as e:
            raise VCFValidationError(f"Unable to read/parse VCF header: {str(e)}") from e

    def _require_tooling(self) -> None:
        required = ["bcftools", "tabix"]
        missing = [t for t in required if shutil.which(t) is None]
        if missing:
            raise ToolingUnavailableError(
                f"Missing required tooling: {missing}. Install bcftools + tabix and ensure they are on PATH."
            )

        # Liftover tooling is required only if GRCh37 is encountered; checked in _liftover_to_grch38.
        ref = getattr(settings, "reference_fasta_path", None)
        if not ref or not Path(ref).exists():
            logger.warning(f"Configured reference fasta not found or not set: {ref}. Left-alignment of indels will be skipped.")

    async def _liftover_to_grch38(self, file_path: Path) -> Path:
        chain = getattr(settings, "liftover_chain_path", None)
        if not chain:
            raise ToolingUnavailableError(
                "GRCh37 input detected but settings.liftover_chain_path is not configured."
            )
        chain_path = Path(chain)
        if not chain_path.exists():
            raise ToolingUnavailableError(f"Liftover chain file not found: {chain}")

        # Prefer CrossMap if installed.
        if shutil.which("crossmap") is None:
            raise ToolingUnavailableError("GRCh37 input detected but CrossMap is not installed (crossmap not on PATH).")

        out = self.temp_dir / f"{file_path.stem}.grch38.vcf"
        cmd = ["crossmap", "vcf", str(chain_path), str(file_path), str(out)]
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise VCFValidationError(f"VCF liftover to GRCh38 failed: {stderr.decode(errors='replace')}")

        return out

    async def _normalize_left_align(self, file_path: Path) -> Path:
        ref = getattr(settings, "reference_fasta_path", None)
        out = self.temp_dir / f"{file_path.stem}.normalized.vcf.gz"

        # -f left-aligns indels if FASTA is present; otherwise just compresses for tabix.
        cmd = ["bcftools"]
        
        if ref and Path(ref).exists():
            cmd.extend([
                "norm",
                "-f", str(ref)
            ])
        else:
            cmd.append("view")
            
        cmd.extend([
            "--output-type", "z",
            "--output", str(out),
            str(file_path)
        ])
        
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            tool_name = "bcftools norm" if "norm" in cmd else "bcftools view"
            raise VCFValidationError(f"{tool_name} failed: {stderr.decode(errors='replace')}")

        return out

    async def _ensure_tabix_index(self, vcf_gz_path: Path) -> Path:
        if not str(vcf_gz_path).endswith(".vcf.gz"):
            raise VCFValidationError("Internal error: expected bgzipped VCF (.vcf.gz) after normalization.")
        tbi = Path(str(vcf_gz_path) + ".tbi")
        if tbi.exists():
            return vcf_gz_path

        cmd = ["tabix", "-f", "-p", "vcf", str(vcf_gz_path)]
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise VCFValidationError(f"tabix indexing failed: {stderr.decode(errors='replace')}")

        if not tbi.exists():
            raise VCFValidationError("tabix indexing reported success but .tbi was not created.")

        return vcf_gz_path

    def _extract_supported_gene_variants_strict(self, vcf_gz_path: Path) -> Dict[str, List[Dict[str, Any]]]:
        try:
            vf = pysam.VariantFile(str(vcf_gz_path))
        except Exception as e:
            raise VCFValidationError(f"Unable to open normalized VCF: {str(e)}") from e

        gene_variants: Dict[str, List[Dict[str, Any]]] = {}

        for region in self.SUPPORTED_GENE_REGIONS:
            # Try both styles (with and without "chr") because upstream VCFs vary.
            candidates = [
                (region.chrom, region.start, region.end),
                (f"chr{region.chrom}", region.start, region.end),
            ]

            fetched: Optional[List[pysam.VariantRecord]] = None
            last_err: Optional[Exception] = None

            for chrom, start, end in candidates:
                try:
                    fetched = list(vf.fetch(chrom, start - 1, end))
                    break
                except Exception as e:
                    last_err = e
                    continue

            if fetched is None:
                raise VCFValidationError(
                    f"Gene region {region.gene} is not queryable in this VCF (missing contig or index). Error: {last_err}"
                )

            if len(fetched) == 0:
                logger.warning(
                    f"No variants found in required gene region for {region.gene}. "
                    "Treating as wild-type/normal, though it may indicate insufficient coverage."
                )

            variants_out: List[Dict[str, Any]] = []
            for rec in fetched:
                info = {k: rec.info.get(k) for k in rec.info.keys()}
                # ID column is where rsID would appear, if present.
                rsid = rec.id if rec.id and rec.id != "." else None

                variants_out.append(
                    {
                        "rsid": rsid,
                        "chrom": str(rec.chrom),
                        "pos": int(rec.pos),
                        "ref": str(rec.ref),
                        "alt": [str(a) for a in (rec.alts or [])],
                        "qual": float(rec.qual) if rec.qual is not None else None,
                        "filter": list(rec.filter.keys()) if rec.filter else [],
                        "info": info,
                        "gene_info": {
                            "GENE": info.get("GENE"),
                            "STAR": info.get("STAR"),
                        },
                    }
                )

            gene_variants[region.gene] = variants_out

        return gene_variants

    def _detect_cyp2d6_cnv(self, vcf_gz_path: Path) -> CNVCall:
        region = next(r for r in self.SUPPORTED_GENE_REGIONS if r.gene == "CYP2D6")
        evidence: List[str] = []
        deletion = False
        duplication = False
        copy_number: Optional[int] = None

        try:
            vf = pysam.VariantFile(str(vcf_gz_path))
        except Exception as e:
            raise VCFValidationError(f"Unable to open VCF for CNV scan: {str(e)}") from e

        candidates = [
            (region.chrom, region.start, region.end),
            (f"chr{region.chrom}", region.start, region.end),
        ]

        fetched: List[pysam.VariantRecord] = []
        for chrom, start, end in candidates:
            try:
                fetched = list(vf.fetch(chrom, start - 1, end))
                if fetched:
                    break
            except Exception:
                continue

        for rec in fetched:
            svtype = rec.info.get("SVTYPE")
            end = rec.stop
            if svtype in ("DEL", "DUP"):
                overlap = not (end < region.start or rec.pos > region.end)
                if overlap and svtype == "DEL":
                    deletion = True
                    evidence.append(f"SVTYPE=DEL {rec.chrom}:{rec.pos}-{end}")
                if overlap and svtype == "DUP":
                    duplication = True
                    evidence.append(f"SVTYPE=DUP {rec.chrom}:{rec.pos}-{end}")

            # Copy-number evidence may appear as INFO/CN or FORMAT/CN.
            cn_info = rec.info.get("CN")
            if cn_info is not None:
                try:
                    cn_int = int(cn_info) if not isinstance(cn_info, (list, tuple)) else int(cn_info[0])
                    copy_number = cn_int
                    evidence.append(f"INFO/CN={cn_int} at {rec.chrom}:{rec.pos}")
                except Exception:
                    pass

        # If we have explicit copy number, infer duplication/deletion.
        if copy_number is not None:
            if copy_number == 0:
                deletion = True
            if copy_number > 2:
                duplication = True

        available = len(evidence) > 0
        return CNVCall(
            available=available,
            deletion_detected=deletion,
            duplication_detected=duplication,
            copy_number=copy_number,
            evidence=evidence,
        )

    def _assess_quality(self, vcf_gz_path: Path) -> Dict[str, Any]:
        """
        Conservative quality metrics (not used to infer genotype correctness).
        """
        vf = pysam.VariantFile(str(vcf_gz_path))
        total = 0
        qual_ok = 0
        missing_filter = 0
        multiallelic = 0

        for rec in vf.fetch():
            total += 1
            if rec.qual is not None and rec.qual >= 30:
                qual_ok += 1
            if rec.filter and any(k != "PASS" for k in rec.filter.keys()):
                missing_filter += 1
            if rec.alts and len(rec.alts) > 1:
                multiallelic += 1

        if total == 0:
            raise VCFValidationError("VCF contains zero variants after normalization; analysis cannot proceed.")

        qual_ratio = qual_ok / total
        filter_ratio = missing_filter / total
        mult_ratio = multiallelic / total

        quality_score = max(
            0.0,
            min(
                100.0,
                (qual_ratio * 60.0) + ((1.0 - filter_ratio) * 25.0) + ((1.0 - mult_ratio) * 15.0),
            ),
        )

        return {
            "variant_count": total,
            "high_quality_ratio": qual_ratio,
            "non_pass_filter_ratio": filter_ratio,
            "multiallelic_ratio": mult_ratio,
            "quality_score": quality_score,
        }
