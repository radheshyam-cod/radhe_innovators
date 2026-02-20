import sys
import os
import json
from datetime import datetime
from sqlalchemy.orm import Session

# Add the project root to sys.path so "backend.X" imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.core.database import engine, Base, SessionLocal
from backend.models.schema import Drug, Gene, Phenotype, CPICRule, CPICMetadata, RiskCategory, SeverityLevel, CPICLevel
from backend.services.cpic_engine import CPICRecommendationEngine

# CPIC Database Initialization
Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Drug).count() > 0:
            print("Database already seeded. Run with explicit wipe if you need a refresh.")
            return

        print("Creating Core Genes...")
        genes_data = [
            ("CYP2D6", "Cytochrome P450 2D6"),
            ("CYP2C19", "Cytochrome P450 2C19"),
            ("CYP2C9", "Cytochrome P450 2C9"),
            ("SLCO1B1", "Solute Carrier Organic Anion Transporter Family Member 1B1"),
            ("TPMT", "Thiopurine S-methyltransferase"),
            ("DPYD", "Dihydropyrimidine Dehydrogenase")
        ]
        gene_objs = {}
        for symbol, desc in genes_data:
            obj = Gene(symbol=symbol, description=desc)
            db.add(obj)
            gene_objs[symbol] = obj
        
        db.commit()

        print("Creating Core Drugs and RxNorm Mappings...")
        drugs_data = [
            {"generic": "codeine", "rxnorm": "2670", "atc": ["N02AA05", "R05DA04"], "aliases": ["tylenol with codeine"]},
            {"generic": "warfarin", "rxnorm": "11289", "atc": ["B01AA03"], "aliases": ["coumadin", "jantoven"]},
            {"generic": "clopidogrel", "rxnorm": "32968", "atc": ["B01AC04"], "aliases": ["plavix"]},
            {"generic": "simvastatin", "rxnorm": "36567", "atc": ["C10AA01"], "aliases": ["zocor"]},
            {"generic": "azathioprine", "rxnorm": "1187", "atc": ["L04AX01"], "aliases": ["imuran"]},
            {"generic": "fluorouracil", "rxnorm": "4492", "atc": ["L01BC02"], "aliases": ["5-fu", "adrucil"]}
        ]
        drug_objs = {}
        for d in drugs_data:
            obj = Drug(
                generic_name=d["generic"],
                rxnorm_id=d["rxnorm"],
                atc_codes=d["atc"],
                aliases=d["aliases"]
            )
            db.add(obj)
            drug_objs[d["generic"]] = obj
        
        db.commit()

        print("Migrating CPIC Rules Matrix...")
        # Utilize the existing hardcoded rules array for the seed loop
        engine_inst = CPICRecommendationEngine()
        phenotype_objs = {} # cache by (gene_id, phenotype_name)
        
        for gene_sym, drug_configs in engine_inst.CPIC_RULES.items():
            gene = gene_objs[gene_sym]
            for drug_name, phenotype_configs in drug_configs.items():
                drug = drug_objs[drug_name]
                for pheno_name, rule_obj in phenotype_configs.items():
                    # Upsert phenotype
                    pheno_key = (gene.id, pheno_name)
                    if pheno_key not in phenotype_objs:
                        pheno = Phenotype(gene_id=gene.id, phenotype_code=pheno_name)
                        db.add(pheno)
                        phenotype_objs[pheno_key] = pheno
                        db.flush()
                    
                    pheno = phenotype_objs[pheno_key]

                    # Create CPIC Rule link
                    db.add(CPICRule(
                        gene_id=gene.id,
                        drug_id=drug.id,
                        phenotype_id=pheno.id,
                        risk_label=rule_obj.risk_label,
                        severity=rule_obj.severity,
                        recommendation_text=rule_obj.recommendation_text,
                        dose_adjustment=rule_obj.dose_adjustment,
                        contraindication=rule_obj.contraindication,
                        evidence_level=rule_obj.evidence_level,
                        citations=rule_obj.citations
                    ))

        # Metadata tracking
        print("Saving Metadata Version...")
        db.add(CPICMetadata(
            current_version="2024.1.0",
            effective_date=datetime.utcnow(),
            source_url="https://cpicpgx.org/guidelines/"
        ))

        db.commit()
        print("Database correctly seeded with PharmGKB ontologies and strict SQL CPIC relationships!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
