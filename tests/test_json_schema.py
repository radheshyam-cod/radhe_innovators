"""
Test strict JSON schema compliance.

Validates that CDSResponse matches exact specification.
"""

import pytest
from datetime import datetime
from backend.models.cds_response import (
    CDSResponse,
    RiskAssessment,
    PharmacogenomicProfile,
    DetectedVariant,
    ClinicalRecommendation,
    LLMGeneratedExplanation,
    QualityMetrics,
)


def test_cds_response_schema_compliance():
    """Test that CDSResponse matches exact specification."""
    response = CDSResponse(
        patient_id="PATIENT_001",
        drug="codeine",
        timestamp=datetime.utcnow(),
        risk_assessment=RiskAssessment(
            risk_label="adjust",
            confidence_score=0.95,
            severity="moderate",
        ),
        pharmacogenomic_profile=PharmacogenomicProfile(
            primary_gene="CYP2D6",
            diplotype="*1/*4",
            phenotype="intermediate",
            detected_variants=[
                DetectedVariant(
                    rsid="rs1065852",
                    chrom="22",
                    pos=42524946,
                    ref="G",
                    alt=["A"],
                )
            ],
        ),
        clinical_recommendation=ClinicalRecommendation(
            recommendation_text="Consider alternative analgesic",
            action="Dose adjustment required",
            dose_adjustment="Consider alternative",
            contraindication=False,
            evidence_level="A",
            citations=["PMID: 32192344"],
        ),
        llm_generated_explanation=LLMGeneratedExplanation(
            summary="Patient carries one functional and one non-functional allele.",
            explanation_text="Patient carries one functional and one non-functional allele...",
            biological_mechanism="CYP2D6 enzyme converts codeine to morphine...",
            variant_rsids_mentioned=["rs1065852"],
            cpic_citations=["PMID: 32192344"],
            grounding_score=0.85,
        ),
        quality_metrics=QualityMetrics(
            vcf_parsing_success=True,
            variant_call_quality="high",
            missing_annotations_handled=True,
        ),
    )

    # Serialize to dict
    data = response.model_dump(mode="json")

    # Verify all required keys exist
    assert "patient_id" in data
    assert "drug" in data
    assert "timestamp" in data
    assert "risk_assessment" in data
    assert "pharmacogenomic_profile" in data
    assert "clinical_recommendation" in data
    assert "llm_generated_explanation" in data
    assert "quality_metrics" in data

    # Verify nested structures
    assert "risk_label" in data["risk_assessment"]
    assert "confidence_score" in data["risk_assessment"]
    assert "severity" in data["risk_assessment"]

    assert "primary_gene" in data["pharmacogenomic_profile"]
    assert "diplotype" in data["pharmacogenomic_profile"]
    assert "phenotype" in data["pharmacogenomic_profile"]
    assert "detected_variants" in data["pharmacogenomic_profile"]

    assert "vcf_parsing_success" in data["quality_metrics"]
    assert "variant_call_quality" in data["quality_metrics"]
    assert "missing_annotations_handled" in data["quality_metrics"]

    # Verify timestamp is ISO format
    assert isinstance(data["timestamp"], str)
    datetime.fromisoformat(data["timestamp"].replace("Z", "+00:00"))

    # Verify confidence_score is numeric
    assert isinstance(data["risk_assessment"]["confidence_score"], (int, float))
    assert 0.0 <= data["risk_assessment"]["confidence_score"] <= 1.0
