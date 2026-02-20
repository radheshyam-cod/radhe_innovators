"""
GeneDose.ai Analysis Models

This module defines Pydantic models for pharmacogenomic analysis,
including requests, responses, and data structures for VCF processing
and CPIC recommendations.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class RiskCategory(str, Enum):
    """Risk category for drug-gene interactions"""
    SAFE = "safe"
    ADJUST = "adjust"
    TOXIC = "toxic"
    INEFFECTIVE = "ineffective"
    UNKNOWN = "Unknown"

class CPICLevel(str, Enum):
    """CPIC guideline evidence level"""
    A = "A"  # Strong evidence
    B = "B"  # Moderate evidence

class UserRole(str, Enum):
    """User roles for access control"""
    CLINICIAN = "clinician"
    PHARMACIST = "pharmacist"
    RESEARCHER = "researcher"
    ADMIN = "admin"

class VCFFile(BaseModel):
    """VCF file information"""
    id: str
    name: str
    size: int
    uploaded_at: datetime
    status: str = Field(..., description="File processing status")
    
class StarAllele(BaseModel):
    """Star allele information"""
    gene: str
    allele: str
    position: Optional[str] = None
    reference: Optional[str] = None
    alternate: Optional[str] = None
    zygosity: str = Field(..., description="homozygous or heterozygous")
    confidence: float = Field(..., ge=0.0, le=1.0)

class ActivityScore(BaseModel):
    """Activity score calculation"""
    gene: str
    score: float = Field(..., ge=0.0, le=2.0)
    calculation_method: str
    alleles_considered: List[str]
    phenotype: str

class Recommendation(BaseModel):
    """Drug-gene recommendation"""
    drug: str
    gene: str
    level: CPICLevel
    recommendation: str = Field(..., description="Clinical recommendation")
    action: str = Field(..., description="Suggested clinical action")
    evidence: str = Field(..., description="Supporting evidence")
    explanation: Optional[str] = None
    risk_category: RiskCategory
    severity: Optional[str] = None  # none, low, moderate, high, critical
    contraindication: bool = False
    citations: List[str] = Field(default_factory=list)

class GeneAnalysis(BaseModel):
    """Complete gene analysis results"""
    gene: str
    star_alleles: List[StarAllele]
    activity_score: Optional[ActivityScore] = None
    phenotype: str
    risk_category: RiskCategory
    recommendations: List[Recommendation]
    processing_time_ms: float
    confidence_score: float = Field(..., ge=0.0, le=1.0)

class AnalysisRequest(BaseModel):
    """Analysis request with patient information"""
    patient_id: str = Field(..., min_length=1, description="Patient identifier")
    patient_name: str = Field(..., min_length=1, description="Patient name")
    date_of_birth: str = Field(..., description="Patient date of birth")
    clinical_notes: Optional[str] = None
    vcf_file_id: str
    
    @validator('date_of_birth')
    def validate_dob(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date of birth must be in YYYY-MM-DD format')

class AnalysisSummary(BaseModel):
    """Analysis summary statistics"""
    total_genes: int
    risk_distribution: Dict[RiskCategory, int]
    high_risk_genes: List[str]
    processing_time_seconds: float
    variant_count: int
    genome_build: str
    quality_score: float

class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    analysis_id: str
    patient_id: str
    patient_name: str
    date_of_birth: str
    clinical_notes: Optional[str] = None
    gene_analyses: List[GeneAnalysis]
    summary: AnalysisSummary
    created_at: datetime
    processing_time_seconds: float
    status: str = Field(default="completed")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CPICGuideline(BaseModel):
    """CPIC guideline information"""
    gene: str
    drug: str
    level: CPICLevel
    guideline_url: str
    recommendation_text: str
    evidence_summary: str
    last_updated: datetime

class ValidationResult(BaseModel):
    """VCF file validation results"""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    genome_build: Optional[str] = None
    variant_count: int = 0
    quality_score: float = Field(ge=0.0, le=100.0)
    file_size_mb: float

class ProcessingStatus(BaseModel):
    """Processing status for async operations"""
    task_id: str
    status: str = Field(..., description="pending, processing, completed, error")
    progress: float = Field(ge=0.0, le=100.0)
    current_step: str
    estimated_completion: Optional[datetime] = None
    error_message: Optional[str] = None

class User(BaseModel):
    """User information"""
    id: str
    email: str
    name: str
    role: UserRole
    created_at: datetime
    last_login: Optional[datetime] = None

class DrugSearchRequest(BaseModel):
    """Drug search request"""
    query: str = Field(..., min_length=2, description="Drug name to search")
    include_guidelines: bool = True
    gene_filter: Optional[List[str]] = None

class DrugSearchResult(BaseModel):
    """Drug search result"""
    drug_name: str
    relevant_genes: List[str]
    guidelines: List[CPICGuideline] = Field(default_factory=list)
    summary: str

class PatientWalletCard(BaseModel):
    """Patient wallet card for mobile"""
    patient_id: str
    patient_name: str
    date_of_birth: str
    critical_interactions: List[Dict[str, Any]]
    emergency_contact: Optional[str] = None
    generated_at: datetime
    qr_code: str  # Base64 encoded QR code

class AdvancedAnalysisRequest(BaseModel):
    """Advanced analysis request for pharmacists"""
    analysis_id: str
    include_phenoconversion: bool = True
    include_activity_breakdown: bool = True
    include_raw_alleles: bool = True
    custom_thresholds: Optional[Dict[str, float]] = None

class PhenoconversionLayer(BaseModel):
    """Phenoconversion analysis results"""
    gene: str
    base_phenotype: str
    converted_phenotype: str
    converting_drugs: List[str]
    clinical_impact: str

# JSON Schema for final output
ANALYSIS_RESPONSE_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "analysis_id": {"type": "string"},
        "patient_id": {"type": "string"},
        "patient_name": {"type": "string"},
        "date_of_birth": {"type": "string"},
        "clinical_notes": {"type": "string"},
        "gene_analyses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "gene": {"type": "string"},
                    "star_alleles": {"type": "array"},
                    "activity_score": {"type": "object"},
                    "phenotype": {"type": "string"},
                    "risk_category": {"type": "string"},
                    "recommendations": {"type": "array"},
                    "processing_time_ms": {"type": "number"},
                    "confidence_score": {"type": "number"}
                },
                "required": ["gene", "star_alleles", "phenotype", "risk_category", "recommendations"]
            }
        },
        "summary": {"type": "object"},
        "created_at": {"type": "string"},
        "processing_time_seconds": {"type": "number"},
        "status": {"type": "string"}
    },
    "required": ["analysis_id", "patient_id", "patient_name", "date_of_birth", "gene_analyses", "summary", "created_at", "processing_time_seconds", "status"]
}
