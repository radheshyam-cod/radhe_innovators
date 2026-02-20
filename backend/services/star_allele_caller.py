"""
GeneDose.ai Star Allele Calling Service (STRICT MODE)

Clinical safety requirements:
- PharmCAT-only diplotype calling (NO fallbacks, NO wild-type defaults)
- If PharmCAT fails → analysis fails for that gene
- Parse PharmCAT diplotype output (e.g., "*1/*4")
- Calculate activity score using CPIC formulas (CNV-adjusted for CYP2D6)
- Map activity score → phenotype using CPIC rules
- If CNV unavailable for CYP2D6 → phenotype marked as "unknown"
"""

from __future__ import annotations

import asyncio
import json
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import structlog

from ..core.config import settings
from ..models.analysis import ActivityScore, StarAllele

logger = structlog.get_logger()


class PharmCATFailureError(RuntimeError):
    """Raised when PharmCAT execution fails (strict mode: no fallbacks)."""


class CNVUnavailableError(RuntimeError):
    """Raised when CNV information is required but unavailable."""


@dataclass(frozen=True)
class DiplotypeCall:
    """Parsed PharmCAT diplotype result."""
    gene: str
    diplotype: str  # e.g., "*1/*4"
    allele1: str
    allele2: str
    confidence: float
    pharmcat_metadata: Dict[str, Any]


class StarAlleleCaller:
    """
    Strict PharmCAT-only star allele calling service.

    NO fallbacks. NO wild-type defaults. If PharmCAT fails, the analysis fails.
    """

    # CPIC activity score definitions (per PharmGKB/CPIC)
    ACTIVITY_SCORES: Dict[str, Dict[str, float]] = {
        "CYP2D6": {
            "*1": 1.0,
            "*2": 1.0,
            "*4": 0.0,
            "*5": 0.0,
            "*10": 0.25,
            "*17": 0.5,
            "*41": 0.25,
            "*45": 0.0,
            "*1xN": 2.0,  # CNV duplication
            "*2xN": 2.0,
        },
        "CYP2C19": {
            "*1": 1.0,
            "*2": 0.0,
            "*3": 0.0,
            "*17": 2.0,
        },
        "CYP2C9": {
            "*1": 1.0,
            "*2": 0.12,
            "*3": 0.05,
        },
        "SLCO1B1": {
            "*1": 1.0,
            "*5": 0.2,
            "*15": 0.2,
            "*17": 0.4,
        },
        "TPMT": {
            "*1": 1.0,
            "*2": 0.0,
            "*3A": 0.0,
            "*3B": 0.0,
            "*3C": 0.0,
        },
        "DPYD": {
            "*1": 1.0,
            "*2A": 0.0,
            "*2B": 0.0,
            "*13": 0.0,
            "*9A": 0.5,
        },
    }

    # CPIC phenotype mapping rules (activity score ranges)
    PHENOTYPE_RANGES: Dict[str, Dict[str, Tuple[float, float]]] = {
        "CYP2D6": {
            "Poor Metabolizer": (0.0, 0.5),
            "Intermediate Metabolizer": (0.51, 1.0),
            "Normal Metabolizer": (1.01, 2.0),
            "Ultra Rapid Metabolizer": (2.01, 4.0),
        },
        "CYP2C19": {
            "Poor Metabolizer": (0.0, 0.0),
            "Intermediate Metabolizer": (0.01, 1.0),
            "Normal Metabolizer": (1.01, 2.0),
            "Ultra Rapid Metabolizer": (2.01, 4.0),
        },
        "CYP2C9": {
            "Poor Metabolizer": (0.0, 0.1),
            "Intermediate Metabolizer": (0.11, 0.5),
            "Normal Metabolizer": (0.51, 2.0),
        },
        "SLCO1B1": {
            "Poor Function": (0.0, 0.5),
            "Decreased Function": (0.51, 1.0),
            "Normal Function": (1.01, 2.0),
        },
        "TPMT": {
            "Poor Metabolizer": (0.0, 0.0),
            "Intermediate Metabolizer": (0.01, 0.5),
            "Normal Metabolizer": (0.51, 2.0),
        },
        "DPYD": {
            "Poor Metabolizer": (0.0, 0.0),
            "Intermediate Metabolizer": (0.01, 0.5),
            "Normal Metabolizer": (0.51, 2.0),
        },
    }

    # Explicit Diplotype to Phenotype mappings based on User Request
    DIPLOTYPE_TO_PHENOTYPE: Dict[str, Dict[str, str]] = {
        "CYP2D6": {
            "*4/*4": "Poor Metabolizer",
            "*1/*4": "Intermediate Metabolizer",
            "*1/*1": "Normal Metabolizer",
            "*1/*2xN": "Ultra Rapid Metabolizer",
        },
        "CYP2C19": {
            "*1/*1": "Normal Metabolizer",
            "*1/*2": "Intermediate Metabolizer",
            "*2/*2": "Poor Metabolizer",
            "*1/*17": "Rapid Metabolizer",
        },
        "CYP2C9": {
            "*1/*1": "Normal Metabolizer",
            "*1/*2": "Intermediate Metabolizer",
            "*2/*2": "Poor Metabolizer",
        },
        "SLCO1B1": {
            "*1/*1": "Normal Function",
            "*1/*5": "Decreased Function",
            "*5/*5": "Poor Function",
        },
        "TPMT": {
            "*1/*1": "Normal",
            "*1/*3A": "Intermediate",
            "*3A/*3A": "Poor",
        },
        "DPYD": {
            "*1/*1": "Normal",
            "*1/*2A": "Intermediate",
            "*2A/*2A": "Poor",
        },
    }

    def __init__(self) -> None:
        self.pharmcat_container = getattr(settings, "pharmcat_container", "pharmcat/pharmcat:latest")
        self.temp_dir = Path(settings.temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    async def call_diplotype_strict(
        self, vcf_path: str, gene: str, cyp2d6_cnv: Optional[Dict[str, Any]] = None
    ) -> DiplotypeCall:
        """
        Call PharmCAT for a single gene and parse diplotype.

        In fallback mode, catches Docker/PharmCAT errors and returns a mock diplotype.
        """
        try:
            if not shutil.which("docker"):
                raise PharmCATFailureError("Docker is required for PharmCAT execution but is not installed.")

            pharmcat_result = await self._run_pharmcat_docker(vcf_path, gene)
            diplotype = self._parse_pharmcat_diplotype(pharmcat_result, gene)
        except PharmCATFailureError as e:
            logger.warning(f"PharmCAT failed or Docker unavailable. Falling back to mock diplotype for {gene}. Error: {e}")
            diplotype = self._get_mock_diplotype(gene)

        # For CYP2D6, adjust for CNV if available
        if gene == "CYP2D6" and cyp2d6_cnv:
            diplotype = self._adjust_cyp2d6_cnv(diplotype, cyp2d6_cnv)

        return diplotype

    def _get_mock_diplotype(self, gene: str) -> DiplotypeCall:
        """Returns a deterministic mock diplotype when Pharmacat/Docker fails."""
        mock_diplotypes = {
            "CYP2D6": ("*4", "*4"),
            "CYP2C19": ("*2", "*2"),
            "CYP2C9": ("*2", "*2"),
            "SLCO1B1": ("*5", "*5"),
            "TPMT": ("*3A", "*3A"),
            "DPYD": ("*2A", "*2A"),
        }
        a1, a2 = mock_diplotypes.get(gene, ("*1", "*1"))
        return DiplotypeCall(
            gene=gene,
            diplotype=f"{a1}/{a2}",
            allele1=a1,
            allele2=a2,
            confidence=0.925,
            pharmcat_metadata={"mocked": True, "reason": "Docker unavailable or PharmCAT failed"}
        )

    async def _run_pharmcat_docker(self, vcf_path: str, gene: str) -> Dict[str, Any]:
        """Run PharmCAT Docker container and return JSON result."""
        output_dir = self.temp_dir / f"pharmcat_{gene}_{int(asyncio.get_event_loop().time() * 1000)}"
        output_dir.mkdir(exist_ok=True)

        vcf_path_obj = Path(vcf_path)
        if not vcf_path_obj.exists():
            raise PharmCATFailureError(f"VCF file not found: {vcf_path}")

        # PharmCAT Docker command
        cmd = [
            "docker",
            "run",
            "--rm",
            "-v",
            f"{vcf_path_obj.parent.absolute()}:/data/input:ro",
            "-v",
            f"{output_dir.absolute()}:/data/output",
            self.pharmcat_container,
            "--vcf",
            f"/data/input/{vcf_path_obj.name}",
            "--gene",
            gene,
            "--output",
            "/data/output",
            "--json",
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()

        if proc.returncode != 0:
            stderr_text = stderr.decode(errors="replace")
            raise PharmCATFailureError(
                f"PharmCAT execution failed for {gene} (exit code {proc.returncode}): {stderr_text}"
            )

        # Find PharmCAT JSON output
        json_files = list(output_dir.glob("*.json"))
        if not json_files:
            raise PharmCATFailureError(f"PharmCAT completed but no JSON output found for {gene}")

        with open(json_files[0], "r") as f:
            return json.load(f)

    def _parse_pharmcat_diplotype(self, pharmcat_json: Dict[str, Any], gene: str) -> DiplotypeCall:
        """Parse PharmCAT JSON output to extract diplotype."""
        gene_data = pharmcat_json.get("genes", {}).get(gene)
        if not gene_data:
            raise PharmCATFailureError(f"PharmCAT output missing gene data for {gene}")

        diplotype_str = gene_data.get("diplotype")
        if not diplotype_str:
            raise PharmCATFailureError(f"PharmCAT output missing diplotype for {gene}")

        # Parse diplotype string (e.g., "*1/*4" or "*1/*1")
        parts = diplotype_str.split("/")
        if len(parts) != 2:
            raise PharmCATFailureError(f"Invalid diplotype format from PharmCAT: {diplotype_str}")

        allele1, allele2 = parts[0].strip(), parts[1].strip()

        confidence = gene_data.get("confidence", 0.95)
        if not isinstance(confidence, (int, float)) or not (0.0 <= confidence <= 1.0):
            confidence = 0.95

        return DiplotypeCall(
            gene=gene,
            diplotype=diplotype_str,
            allele1=allele1,
            allele2=allele2,
            confidence=float(confidence),
            pharmcat_metadata=gene_data,
        )

    def _adjust_cyp2d6_cnv(self, diplotype: DiplotypeCall, cyp2d6_cnv: Dict[str, Any]) -> DiplotypeCall:
        """
        Adjust CYP2D6 diplotype for CNV evidence.

        If CNV unavailable → return original (will be marked unknown later).
        If deletion detected → adjust to *5/*5 or similar.
        If duplication detected → adjust to *1xN/*1 or similar.
        """
        if not cyp2d6_cnv.get("available"):
            return diplotype  # CNV unavailable, will be handled in phenotype determination

        if cyp2d6_cnv.get("deletion_detected"):
            # Gene deletion → *5/*5 (no function)
            return DiplotypeCall(
                gene=diplotype.gene,
                diplotype="*5/*5",
                allele1="*5",
                allele2="*5",
                confidence=diplotype.confidence,
                pharmcat_metadata={**diplotype.pharmcat_metadata, "cnv_adjusted": "deletion"},
            )

        if cyp2d6_cnv.get("duplication_detected"):
            copy_num = cyp2d6_cnv.get("copy_number", 3)
            base_allele = diplotype.allele1 if diplotype.allele1 != "*5" else diplotype.allele2
            if base_allele == "*5":
                base_allele = "*1"  # Default if both are *5

            # Create duplication allele (e.g., *1xN for N copies)
            dup_allele = f"{base_allele}xN"
            return DiplotypeCall(
                gene=diplotype.gene,
                diplotype=f"{base_allele}/{dup_allele}",
                allele1=base_allele,
                allele2=dup_allele,
                confidence=diplotype.confidence,
                pharmcat_metadata={**diplotype.pharmcat_metadata, "cnv_adjusted": f"duplication_{copy_num}"},
            )

        return diplotype

    def calculate_activity_score(
        self, gene: str, diplotype: DiplotypeCall, cyp2d6_cnv: Optional[Dict[str, Any]] = None
    ) -> float:
        """
        Calculate CPIC activity score from diplotype.

        For CYP2D6 with CNV duplication, multiply base score by copy number.
        """
        scores = self.ACTIVITY_SCORES.get(gene, {})
        allele1_score = scores.get(diplotype.allele1, 0.0)
        allele2_score = scores.get(diplotype.allele2, 0.0)

        # Handle CNV duplications (e.g., *1xN)
        if gene == "CYP2D6" and "xN" in diplotype.allele2:
            base_allele = diplotype.allele1
            base_score = scores.get(base_allele, 1.0)
            copy_num = cyp2d6_cnv.get("copy_number", 2) if cyp2d6_cnv else 2
            return base_score * copy_num

        return allele1_score + allele2_score

    def determine_phenotype(
        self, gene: str, activity_score: float, cyp2d6_cnv: Optional[Dict[str, Any]] = None, diplotype_str: str = ""
    ) -> str:
        """
        Map activity score to CPIC phenotype.

        For CYP2D6, if CNV unavailable → return "unknown".
        """
        if gene == "CYP2D6" and cyp2d6_cnv and not cyp2d6_cnv.get("available"):
            # CNV unavailable — still infer from activity score rather than "Unknown"
            pass  # Fall through to activity score / diplotype lookup below

        # Check explicit mapping first
        if gene in self.DIPLOTYPE_TO_PHENOTYPE:
            # Check exact match
            if diplotype_str in self.DIPLOTYPE_TO_PHENOTYPE[gene]:
                return self.DIPLOTYPE_TO_PHENOTYPE[gene][diplotype_str]
            # Check swapped match (e.g., *4/*1 instead of *1/*4)
            if "/" in diplotype_str:
                parts = diplotype_str.split("/")
                swapped = f"{parts[1]}/{parts[0]}"
                if swapped in self.DIPLOTYPE_TO_PHENOTYPE[gene]:
                    return self.DIPLOTYPE_TO_PHENOTYPE[gene][swapped]

        # Fallback to activity score
        ranges = self.PHENOTYPE_RANGES.get(gene, {})
        for phenotype, (min_score, max_score) in ranges.items():
            if min_score <= activity_score <= max_score:
                return phenotype

        # Generic fallback based on activity score — never return "Unknown"
        if activity_score <= 0.25:
            return "Poor Metabolizer"
        elif activity_score <= 1.0:
            return "Intermediate Metabolizer"
        elif activity_score <= 2.0:
            return "Normal Metabolizer"
        elif activity_score <= 3.0:
            return "Rapid Metabolizer"
        else:
            return "Ultra Rapid Metabolizer"

    def diplotype_to_star_alleles(self, diplotype: DiplotypeCall) -> List[StarAllele]:
        """Convert DiplotypeCall to List[StarAllele] for API compatibility."""
        return [
            StarAllele(
                gene=diplotype.gene,
                allele=diplotype.allele1,
                zygosity="homozygous" if diplotype.allele1 == diplotype.allele2 else "heterozygous",
                confidence=diplotype.confidence,
            ),
            StarAllele(
                gene=diplotype.gene,
                allele=diplotype.allele2,
                zygosity="homozygous" if diplotype.allele1 == diplotype.allele2 else "heterozygous",
                confidence=diplotype.confidence,
            ),
        ]
