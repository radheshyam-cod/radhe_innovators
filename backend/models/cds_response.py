"""
Strict CDS JSON Output Schema Models

Matches exact specification:
{
  "patient_id": "",
  "drug": "",
  "timestamp": "ISO8601",
  "risk_assessment": {
    "risk_label": "",
    "confidence_score": 0.0,
    "severity": ""
  },
  "pharmacogenomic_profile": {
    "primary_gene": "",
    "diplotype": "",
    "phenotype": "",
    "detected_variants": []
  },
  "clinical_recommendation": {},
  "llm_generated_explanation": {},
  "quality_metrics": {
    "vcf_parsing_success": true,
    "variant_call_quality": "",
    "missing_annotations_handled": true
  }
}
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .analysis import RiskCategory


class RiskAssessment(BaseModel):
    """Risk assessment structure."""
    risk_label: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    severity: str  # none, low, moderate, high, critical


class DetectedVariant(BaseModel):
    """Detected variant information."""
    rsid: Optional[str] = None
    chrom: str
    pos: int
    ref: str
    alt: List[str]
    gene_info: Optional[Dict[str, Any]] = None


class PharmacogenomicProfile(BaseModel):
    """Pharmacogenomic profile structure."""
    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: List[DetectedVariant]


class ClinicalRecommendation(BaseModel):
    """Clinical recommendation structure."""
    recommendation_text: str
    action: str
    dose_adjustment: Optional[str] = None
    contraindication: bool = False
    evidence_level: str
    citations: List[str] = Field(default_factory=list)


class LLMGeneratedExplanation(BaseModel):
    """LLM-generated explanation structure matching exact specification."""
    summary: str  # Primary summary field (matches image schema)
    explanation_text: Optional[str] = None  # Full explanation (backward compat)
    biological_mechanism: Optional[str] = None
    variant_rsids_mentioned: List[str] = Field(default_factory=list)
    cpic_citations: List[str] = Field(default_factory=list)
    grounding_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class QualityMetrics(BaseModel):
    """Quality metrics structure."""
    vcf_parsing_success: bool
    variant_call_quality: str  # e.g., "high", "medium", "low"
    missing_annotations_handled: bool


class CDSDrugResult(BaseModel):
    """Result for a specific drug in a polypharmacy query."""
    drug: str
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMGeneratedExplanation
    quality_metrics: QualityMetrics

class CDSOverallSummary(BaseModel):
    highest_severity: str
    drugs_flagged: int

class CDSResponse(BaseModel):
    """Single-drug CDS JSON output schema matching exact specification."""
    patient_id: str
    drug: str
    timestamp: datetime
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMGeneratedExplanation
    quality_metrics: QualityMetrics

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class CDSPolypharmacyResponse(BaseModel):
    """Strict CDS JSON output schema supporting polypharmacy arrays."""
    patient_id: str
    timestamp: datetime
    results: List[CDSDrugResult]
    overall_summary: CDSOverallSummary

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
