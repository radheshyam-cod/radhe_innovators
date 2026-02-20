"""
Edge case handlers for CDS system.

Explicit handling for all edge cases with NO silent fallbacks.
"""

from typing import Any, Dict, List, Optional

import structlog

logger = structlog.get_logger()


class EdgeCaseHandler:
    """Explicit edge case handling (no silent failures)."""

    @staticmethod
    def handle_missing_variant(gene: str, variant_region: str) -> Dict[str, Any]:
        """Handle case where no variants found in gene region."""
        return {
            "status": "failed",
            "reason": "missing_variant_coverage",
            "message": f"No variants detected in {gene} region ({variant_region}). Cannot determine genotype without variant data.",
            "action": "Obtain VCF with coverage for this gene region or use alternative genotyping method.",
        }

    @staticmethod
    def handle_unknown_allele(gene: str, allele: str) -> Dict[str, Any]:
        """Handle case where allele is not recognized."""
        return {
            "status": "failed",
            "reason": "unknown_allele",
            "message": f"Allele {allele} for {gene} is not recognized in CPIC database.",
            "action": "Verify allele nomenclature or consult CPIC guidelines for variant interpretation.",
        }

    @staticmethod
    def handle_unsupported_drug(drug: str) -> Dict[str, Any]:
        """Handle case where drug is not supported."""
        supported = ["codeine", "warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"]
        return {
            "status": "failed",
            "reason": "unsupported_drug",
            "message": f"Drug '{drug}' is not supported. Supported drugs: {', '.join(supported)}",
            "action": "Use one of the supported drugs or request drug addition.",
        }

    @staticmethod
    def handle_multiple_drugs(drugs: List[str]) -> Dict[str, Any]:
        """Handle case where multiple drugs are requested."""
        return {
            "status": "failed",
            "reason": "multiple_drugs_not_supported",
            "message": f"Multiple drugs requested: {', '.join(drugs)}. CDS endpoint requires single drug per request.",
            "action": "Submit separate requests for each drug or use batch endpoint (if available).",
        }

    @staticmethod
    def handle_corrupted_vcf(error: str) -> Dict[str, Any]:
        """Handle corrupted VCF file."""
        return {
            "status": "failed",
            "reason": "corrupted_vcf",
            "message": f"VCF file appears corrupted or malformed: {error}",
            "action": "Verify VCF file integrity and format (VCFv4.1 or VCFv4.2).",
        }

    @staticmethod
    def handle_missing_gene_coverage(gene: str) -> Dict[str, Any]:
        """Handle missing gene region coverage."""
        return {
            "status": "failed",
            "reason": "missing_gene_coverage",
            "message": f"Gene region for {gene} is not queryable in this VCF (missing contig or index).",
            "action": "Ensure VCF includes chromosome/contig for this gene region and is properly indexed.",
        }

    @staticmethod
    def handle_cnv_unavailable(gene: str) -> Dict[str, Any]:
        """Handle CNV detection unavailable."""
        return {
            "status": "failed",
            "reason": "cnv_unavailable",
            "message": f"CNV information unavailable for {gene}. Phenotype cannot be determined without CNV data.",
            "action": "Obtain CNV testing or use alternative analysis method that includes CNV detection.",
        }

    @staticmethod
    def handle_llm_failure(error: str) -> Dict[str, Any]:
        """Handle LLM service failure."""
        return {
            "status": "failed",
            "reason": "llm_service_failure",
            "message": f"LLM explanation generation failed: {error}",
            "action": "Explanation generation unavailable. Recommendation is still valid but lacks detailed explanation.",
        }

    @staticmethod
    def handle_pharmcat_failure(gene: str, error: str) -> Dict[str, Any]:
        """Handle PharmCAT failure."""
        return {
            "status": "failed",
            "reason": "pharmcat_failure",
            "message": f"PharmCAT star allele calling failed for {gene}: {error}",
            "action": "PharmCAT is required for analysis. Ensure Docker and PharmCAT container are available.",
        }
