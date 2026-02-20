from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base

class RiskCategory(str, enum.Enum):
    SAFE = "safe"
    ADJUST = "adjust"
    TOXIC = "toxic"
    INEFFECTIVE = "ineffective"
    UNKNOWN = "Unknown"

class SeverityLevel(str, enum.Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class CPICLevel(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String, unique=True, index=True, nullable=False)
    rxnorm_id = Column(String, index=True)
    atc_codes = Column(JSON)  # List of ATC codes
    aliases = Column(JSON)    # List of common aliases (e.g., Coumadin)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cpic_rules = relationship("CPICRule", back_populates="drug")

class Gene(Base):
    __tablename__ = "genes"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    phenotypes = relationship("Phenotype", back_populates="gene")
    cpic_rules = relationship("CPICRule", back_populates="gene")

class Phenotype(Base):
    __tablename__ = "phenotypes"

    id = Column(Integer, primary_key=True, index=True)
    gene_id = Column(Integer, ForeignKey("genes.id"), nullable=False)
    phenotype_code = Column(String, nullable=False)  # Poor Metabolizer, Intermediate Metabolizer, Normal Metabolizer, Rapid Metabolizer, Ultra Rapid Metabolizer, Unknown
    activity_score_min = Column(Float, nullable=True)
    activity_score_max = Column(Float, nullable=True)

    # Relationships
    gene = relationship("Gene", back_populates="phenotypes")
    cpic_rules = relationship("CPICRule", back_populates="phenotype")

class CPICRule(Base):
    __tablename__ = "cpic_rules"

    id = Column(Integer, primary_key=True, index=True)
    gene_id = Column(Integer, ForeignKey("genes.id"), nullable=False)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    phenotype_id = Column(Integer, ForeignKey("phenotypes.id"), nullable=False)
    
    risk_label = Column(Enum(RiskCategory), nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    recommendation_text = Column(String, nullable=False)
    dose_adjustment = Column(String)  # Note: text instead of percent to capture "Avoid"
    contraindication = Column(Boolean, default=False)
    evidence_level = Column(Enum(CPICLevel), nullable=False)
    citations = Column(JSON)
    
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationships
    gene = relationship("Gene", back_populates="cpic_rules")
    drug = relationship("Drug", back_populates="cpic_rules")
    phenotype = relationship("Phenotype", back_populates="cpic_rules")

class CPICMetadata(Base):
    __tablename__ = "cpic_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    current_version = Column(String, nullable=False)
    effective_date = Column(DateTime, nullable=False)
    source_url = Column(String)
