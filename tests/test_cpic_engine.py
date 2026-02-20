"""
Automated validation tests for CPIC risk engine.

Tests clinical cases using the hardcoded PHENOTYPE_RISKS fallback
(works without a running PostgreSQL database):
- CYP2D6 *1/*5 deletion case
- CYP2D6 duplication case
- DPYD deficiency
- SLCO1B1 c.521C variant
- CYP2C19 *2/*2 poor metabolizer
- Warfarin CYP2C9*3 carrier
"""

import pytest
from backend.services.cpic_engine import CPICRecommendationEngine
from backend.models.schema import SeverityLevel
from backend.models.analysis import RiskCategory


@pytest.fixture
def cpic_engine():
    return CPICRecommendationEngine()


@pytest.mark.asyncio
async def test_cyp2d6_deletion_poor_metabolizer(cpic_engine):
    """Test CYP2D6 Poor Metabolizer → codeine ineffective."""
    rec = await cpic_engine.get_recommendation("CYP2D6", "codeine", "Poor Metabolizer")
    assert rec is not None, "Recommendation should not be None for CYP2D6/codeine/Poor Metabolizer"
    assert rec.risk_category == RiskCategory.INEFFECTIVE
    assert rec.contraindication is False  # INEFFECTIVE maps to contraindication=False (only TOXIC → True)


@pytest.mark.asyncio
async def test_cyp2d6_duplication_ultrarapid(cpic_engine):
    """Test CYP2D6 Ultra Rapid Metabolizer → codeine toxic."""
    rec = await cpic_engine.get_recommendation("CYP2D6", "codeine", "Ultra Rapid Metabolizer")
    assert rec is not None, "Recommendation should not be None for CYP2D6/codeine/Ultra Rapid Metabolizer"
    assert rec.risk_category == RiskCategory.TOXIC
    assert rec.contraindication is True


@pytest.mark.asyncio
async def test_dpyd_deficiency_fluorouracil(cpic_engine):
    """Test DPYD poor → fluorouracil toxic."""
    rec = await cpic_engine.get_recommendation("DPYD", "fluorouracil", "Poor")
    assert rec is not None, "Recommendation should not be None for DPYD/fluorouracil/Poor"
    assert rec.risk_category == RiskCategory.TOXIC
    assert rec.contraindication is True


@pytest.mark.asyncio
async def test_slco1b1_poor_simvastatin(cpic_engine):
    """Test SLCO1B1 Poor Function → simvastatin toxic."""
    rec = await cpic_engine.get_recommendation("SLCO1B1", "simvastatin", "Poor Function")
    assert rec is not None, "Recommendation should not be None for SLCO1B1/simvastatin/Poor Function"
    assert rec.risk_category == RiskCategory.TOXIC
    assert rec.contraindication is True


@pytest.mark.asyncio
async def test_cyp2c19_poor_clopidogrel(cpic_engine):
    """Test CYP2C19 Poor Metabolizer → clopidogrel ineffective."""
    rec = await cpic_engine.get_recommendation("CYP2C19", "clopidogrel", "Poor Metabolizer")
    assert rec is not None, "Recommendation should not be None for CYP2C19/clopidogrel/Poor Metabolizer"
    assert rec.risk_category == RiskCategory.INEFFECTIVE
    assert rec.contraindication is False


@pytest.mark.asyncio
async def test_cyp2c9_intermediate_warfarin(cpic_engine):
    """Test CYP2C9 Intermediate Metabolizer → warfarin adjust."""
    rec = await cpic_engine.get_recommendation("CYP2C9", "warfarin", "Intermediate Metabolizer")
    assert rec is not None, "Recommendation should not be None for CYP2C9/warfarin/Intermediate Metabolizer"
    assert rec.risk_category == RiskCategory.ADJUST


@pytest.mark.asyncio
async def test_cyp2c9_poor_warfarin(cpic_engine):
    """Test CYP2C9 Poor Metabolizer → warfarin toxic."""
    rec = await cpic_engine.get_recommendation("CYP2C9", "warfarin", "Poor Metabolizer")
    assert rec is not None, "Recommendation should not be None for CYP2C9/warfarin/Poor Metabolizer"
    assert rec.risk_category == RiskCategory.TOXIC
    assert rec.contraindication is True


@pytest.mark.asyncio
async def test_tpmt_poor_azathioprine(cpic_engine):
    """Test TPMT Poor → azathioprine toxic."""
    rec = await cpic_engine.get_recommendation("TPMT", "azathioprine", "Poor")
    assert rec is not None, "Recommendation should not be None for TPMT/azathioprine/Poor"
    assert rec.risk_category == RiskCategory.TOXIC
    assert rec.contraindication is True


@pytest.mark.asyncio
async def test_normal_metabolizer_safe(cpic_engine):
    """Test that normal metabolizers get Safe risk for codeine."""
    rec = await cpic_engine.get_recommendation("CYP2D6", "codeine", "Normal Metabolizer")
    assert rec is not None, "Recommendation should not be None for CYP2D6/codeine/Normal Metabolizer"
    assert rec.risk_category == RiskCategory.SAFE


@pytest.mark.asyncio
async def test_unsupported_drug_returns_none(cpic_engine):
    """Test that unsupported drugs return None."""
    rec = await cpic_engine.get_recommendation("CYP2D6", "aspirin", "Normal Metabolizer")
    # aspirin is mapped to CYP2C9 in gene_drug_mapping, but has no PHENOTYPE_RISKS entry
    # The DB path will also likely return None for this combo
    assert rec is None


@pytest.mark.asyncio
async def test_unknown_phenotype_returns_none(cpic_engine):
    """Test that unknown phenotypes return None."""
    rec = await cpic_engine.get_recommendation("CYP2D6", "codeine", "unknown_genotype")
    assert rec is None
