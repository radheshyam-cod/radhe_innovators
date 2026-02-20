import asyncio
from backend.services.star_allele_caller import StarAlleleCaller, DiplotypeCall
from backend.services.cpic_engine import CPICRecommendationEngine

async def main():
    caller = StarAlleleCaller()
    
    # Test Diplotype -> Phenotype
    print("Testing Diplotype -> Phenotype Mappings...")
    test_cases = [
        ("CYP2D6", "*4/*4", "PM"),
        ("CYP2D6", "*1/*4", "IM"),
        ("CYP2D6", "*1/*1", "NM"),
        ("CYP2D6", "*1/*2xN", "URM"),
        ("CYP2D6", "*2xN/*1", "URM"), # Swapped test
        ("CYP2C19", "*1/*17", "RM"),
    ]
    
    for gene, diplotype, expected in test_cases:
        actual = caller.determine_phenotype(gene, 0.0, diplotype_str=diplotype)
        print(f"{gene} {diplotype}: Expected {expected}, Got {actual} -> {'PASS' if expected == actual else 'FAIL'}")

    print("\nTesting Phenotype -> Risk Mappings...")
    engine = CPICRecommendationEngine()
    
    # Test Phenotype -> Risk Category
    test_cases_risk = [
        ("CYP2D6", "codeine", "PM", "ineffective"),
        ("CYP2D6", "codeine", "IM", "adjust"),
        ("CYP2C9", "warfarin", "PM", "toxic"),
        ("SLCO1B1", "simvastatin", "Poor Function", "toxic"),
    ]
    
    for gene, drug, phenotype, expected in test_cases_risk:
        rec = await engine.get_recommendation(gene, drug, phenotype)
        if rec:
            actual = rec.risk_category.value
            print(f"{drug} ({gene}) {phenotype}: Expected {expected}, Got {actual} -> {'PASS' if expected == actual else 'FAIL'}")
        else:
            print(f"{drug} ({gene}) {phenotype}: Failed to get recommendation")

if __name__ == "__main__":
    asyncio.run(main())
