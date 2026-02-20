"""
Comprehensive Gene-Drug Mapping
Based on CPIC guidelines and pharmacogenomic evidence.
Includes RxNorm IDs and ATC codes where available.
"""

# Primary gene for each drug (used for analysis)
DRUG_TO_PRIMARY_GENE = {
    # Core 6 drugs
    "codeine": "CYP2D6",
    "warfarin": "CYP2C9",  # Also CYP4F2, VKORC1
    "clopidogrel": "CYP2C19",
    "simvastatin": "SLCO1B1",
    "azathioprine": "TPMT",  # Also NUDT15
    "fluorouracil": "DPYD",
    
    # Additional CYP2D6 drugs
    "tramadol": "CYP2D6",
    "amitriptyline": "CYP2D6",
    "atomoxetine": "CYP2D6",
    "tamoxifen": "CYP2D6",
    "paroxetine": "CYP2D6",
    "venlafaxine": "CYP2D6",
    "nortriptyline": "CYP2D6",
    "ondansetron": "CYP2D6",
    "tropisetron": "CYP2D6",
    "aripiprazole": "CYP2D6",
    "clomipramine": "CYP2D6",
    "desipramine": "CYP2D6",
    "doxepin": "CYP2D6",
    "fluvoxamine": "CYP2D6",
    "hydrocodone": "CYP2D6",
    "imipramine": "CYP2D6",
    "metoprolol": "CYP2D6",
    "risperidone": "CYP2D6",
    "trimipramine": "CYP2D6",
    "amoxapine": "CYP2D6",
    "amphetamine": "CYP2D6",
    "brexpiprazole": "CYP2D6",
    "cevimeline": "CYP2D6",
    "clozapine": "CYP2D6",
    "deutetrabenazine": "CYP2D6",
    "dextromethorphan": "CYP2D6",
    "donepezil": "CYP2D6",
    "flecainide": "CYP2D6",
    "gefitinib": "CYP2D6",
    "haloperidol": "CYP2D6",
    "iloperidone": "CYP2D6",
    "labetalol": "CYP2D6",
    "lofexidine": "CYP2D6",
    "meclizine": "CYP2D6",
    "metoclopramide": "CYP2D6",
    "mirabegron": "CYP2D6",
    "mirtazapine": "CYP2D6",
    "perphenazine": "CYP2D6",
    "propafenone": "CYP2D6",
    "protriptyline": "CYP2D6",
    "tamsulosin": "CYP2D6",
    "thioridazine": "CYP2D6",
    "timolol": "CYP2D6",
    "valbenazine": "CYP2D6",
    "zuclopenthixol": "CYP2D6",
    "acebutolol": "CYP2D6",
    "betaxolol": "CYP2D6",
    "bisoprolol": "CYP2D6",
    "carvedilol": "CYP2D6",
    "nebivolol": "CYP2D6",
    "propranolol": "CYP2D6",
    "darifenacin": "CYP2D6",
    "dolasetron": "CYP2D6",
    "fesoterodine": "CYP2D6",
    "galantamine": "CYP2D6",
    "palonosetron": "CYP2D6",
    "pitolisant": "CYP2D6",
    "tolterodine": "CYP2D6",
    "eliglustat": "CYP2D6",
    "oliceridine": "CYP2D6",
    "pimozide": "CYP2D6",
    "tetrabenazine": "CYP2D6",
    "oxycodone": "CYP2D6",
    "modafinil": "CYP2D6",
    "methylphenidate": "CYP2D6",
    "terbinafine": "CYP2D6",
    
    # CYP2C19 drugs
    "citalopram": "CYP2C19",
    "escitalopram": "CYP2C19",
    "sertraline": "CYP2C19",
    "voriconazole": "CYP2C19",
    "omeprazole": "CYP2C19",
    "pantoprazole": "CYP2C19",
    "lansoprazole": "CYP2C19",
    "rabeprazole": "CYP2C19",
    "dexlansoprazole": "CYP2C19",
    "esomeprazole": "CYP2C19",
    "brivaracetam": "CYP2C19",
    "carisoprodol": "CYP2C19",
    "clobazam": "CYP2C19",
    "diazepam": "CYP2C19",
    "duloxetine": "CYP2C19",
    "flibanserin": "CYP2C19",
    
    # CYP2C9 drugs
    "phenytoin": "CYP2C9",
    "celecoxib": "CYP2C9",
    "ibuprofen": "CYP2C9",
    "flurbiprofen": "CYP2C9",
    "fosphenytoin": "CYP2C9",
    "lornoxicam": "CYP2C9",
    "meloxicam": "CYP2C9",
    "piroxicam": "CYP2C9",
    "tenoxicam": "CYP2C9",
    "acenocoumarol": "CYP2C9",
    "diclofenac": "CYP2C9",
    "indomethacin": "CYP2C9",
    "nabumetone": "CYP2C9",
    "naproxen": "CYP2C9",
    "aceclofenac": "CYP2C9",
    "aspirin": "CYP2C9",
    "dronabinol": "CYP2C9",
    "erdafitinib": "CYP2C9",
    "flibanserin": "CYP2C9",
    "lesinurad": "CYP2C9",
    "lumiracoxib": "CYP2C9",
    "siponimod": "CYP2C9",
    "avatrombopag": "CYP2C9",
    
    # SLCO1B1 drugs (statins)
    "atorvastatin": "SLCO1B1",
    "pravastatin": "SLCO1B1",
    "rosuvastatin": "SLCO1B1",
    "pitavastatin": "SLCO1B1",
    "fluvastatin": "SLCO1B1",
    "lovastatin": "SLCO1B1",
    "elagolix": "SLCO1B1",
    "methotrexate": "SLCO1B1",
    
    # TPMT drugs
    "mercaptopurine": "TPMT",
    "thioguanine": "TPMT",
    
    # DPYD drugs
    "capecitabine": "DPYD",
    "tegafur": "DPYD",
    
    # NUDT15 drugs
    # azathioprine, mercaptopurine, thioguanine (shared with TPMT)
    
    # HLA-B drugs
    "abacavir": "HLA-B",
    "allopurinol": "HLA-B",
    "carbamazepine": "HLA-B",
    "fosphenytoin": "HLA-B",  # Also CYP2C9
    "phenytoin": "HLA-B",  # Also CYP2C9
    "oxcarbazepine": "HLA-B",
    "dapsone": "HLA-B",
    "nevirapine": "HLA-B",
    "propylthiouracil": "HLA-B",
    "methimazole": "HLA-B",
    "carbimazole": "HLA-B",
    "methazolamide": "HLA-B",
    "pazopanib": "HLA-B",
    
    # UGT1A1 drugs
    "irinotecan": "UGT1A1",
    "atazanavir": "UGT1A1",
    "dolutegravir": "UGT1A1",
    "nilotinib": "UGT1A1",
    "pazopanib": "UGT1A1",
    "raltegravir": "UGT1A1",
    "belinostat": "UGT1A1",
    
    # VKORC1 drugs
    # warfarin (also CYP2C9, CYP4F2)
    "phenprocoumon": "VKORC1",
    
    # CYP4F2 drugs
    # warfarin (also CYP2C9, VKORC1)
    # acenocoumarol (also CYP2C9)
    
    # Additional genes (for future expansion)
    "g6pd": "G6PD",  # Many drugs
    "mt-rnr1": "MT-RNR1",  # Aminoglycosides
    "cacna1s": "CACNA1S",  # Anesthetics
    "ryr1": "RYR1",  # Anesthetics
    "nat2": "NAT2",  # Various
    "cftr": "CFTR",  # Cystic fibrosis drugs
    "ifnl3": "IFNL3",  # Interferons
    "ifnl4": "IFNL4",  # Interferons
    "polg": "POLG",  # Valproic acid
    "gba": "GBA",  # Velaglucerase
    "scn1a": "SCN1A",  # Carbamazepine, phenytoin
    "nags": "NAGS",  # Valproic acid, carglumic acid
    "hla-a": "HLA-A",  # Allopurinol, carbamazepine, oxcarbazepine
    "hla-c": "HLA-C",  # Allopurinol, methazolamide
    "hla-dqa1": "HLA-DQA1",  # Lapatinib
    "hla-drb1": "HLA-DRB1",  # Lapatinib, nevirapine
    "hla-dpb1": "HLA-DPB1",  # Aspirin
    "cyp2b6": "CYP2B6",  # Efavirenz, bupropion, methadone, nevirapine, sertraline
    "cyp3a4": "CYP3A4",  # Statins, tacrolimus
    "cyp3a5": "CYP3A5",  # Tacrolimus, atorvastatin, statins, cyclosporine, sirolimus, midazolam
    "cyp2c8": "CYP2C8",  # Ibuprofen, diclofenac, rosiglitazone
    "abcb1": "ABCB1",  # Digoxin, fentanyl, methotrexate, nevirapine, ondansetron, tenofovir
    "abcg2": "ABCG2",  # Rosuvastatin
    "abcc4": "ABCC4",  # Tenofovir
    "slc28a3": "SLC28A3",  # Daunorubicin, doxorubicin
    "comt": "COMT",  # Opioids, antidepressants
    "oprm1": "OPRM1",  # Opioids
    "htr2a": "HTR2A",  # Antidepressants
    "htr2c": "HTR2C",  # Antipsychotics
    "slc6a4": "SLC6A4",  # Antidepressants
    "mthfr": "MTHFR",  # Methotrexate, carboplatin, l-methylfolate
    "f5": "F5",  # Eltrombopag, hormonal contraceptives
    "mcr4": "MC4R",  # Antipsychotics
    "adrb1": "ADRB1",  # Beta blockers
    "adrb2": "ADRB2",  # Beta blockers, salbutamol
    "adra2c": "ADRA2C",  # Beta blockers
    "grk4": "GRK4",  # Beta blockers
    "grk5": "GRK5",  # Beta blockers
    "drd2": "DRD2",  # Risperidone
    "grik4": "GRIK4",  # Antidepressants
    "htr1a": "HTR1A",  # Paroxetine
    "fkbp5": "FKBP5",  # Antidepressants
    "ankk1": "ANKK1",  # Antipsychotics
    "ces1": "CES1",  # Clopidogrel
    "bche": "BCHE",  # Succinylcholine, mivacurium
    "itpa": "ITPA",  # Interferon
    "ugt2b15": "UGT2B15",  # Oxazepam
    "ugt1a4": "UGT1A4",  # Lamotrigine
    "hprt1": "HPRT1",  # Mycophenolic acid
    "cbr3": "CBR3",  # Anthracyclines
    "has3": "HAS3",  # Anthracyclines
    "nqo1": "NQO1",  # Chemotherapy drugs
    "gstp1": "GSTP1",  # Chemotherapy drugs
    "gstm1": "GSTM1",  # Chemotherapy drugs
    "ercc1": "ERCC1",  # Cisplatin
    "xpc": "XPC",  # Cisplatin
    "acyp2": "ACYP2",  # Cisplatin
    "tyms": "TYMS",  # Fluorouracil, capecitabine
    "umps": "UMPS",  # Fluorouracil
    "c8orf34": "C8orf34",  # Irinotecan
    "sema3c": "SEMA3C",  # Irinotecan
    "dync2h1": "DYNC2H1",  # Etoposide
    "serpinc1": "SERPINC1",  # Eltrombopag
    "atic": "ATIC",  # Methotrexate
    "mtrr": "MTRR",  # Methotrexate
    "cyb5r1": "CYB5R1",  # Metoclopramide
    "cyb5r2": "CYB5R2",  # Metoclopramide
    "cyb5r3": "CYB5R3",  # Metoclopramide
    "cyb5r4": "CYB5R4",  # Metoclopramide
    "cchcr1": "CCHCR1",  # Nevirapine
    "charna3": "CHRNA3",  # Nicotine
    "vdr": "VDR",  # Peginterferon, ribavirin
    "fdps": "FDPS",  # Alendronate, raloxifene, risedronate
    "fcgr3a": "FCGR3A",  # Rituximab
    "coq2": "COQ2",  # Statins
    "hmgcr": "HMGCR",  # Statins
    "kif6": "KIF6",  # Statins
    "ldlr": "LDLR",  # Atorvastatin
    "lpa": "LPA",  # Statins
    "cetp": "CETP",  # Statins
    "apoe": "APOE",  # Atorvastatin
    "add1": "ADD1",  # Furosemide, spironolactone
    "nedd4l": "NEDD4L",  # Hydrochlorothiazide
    "prkca": "PRKCA",  # Hydrochlorothiazide
    "yeats4": "YEATS4",  # Hydrochlorothiazide
    "nt5c2": "NT5C2",  # Gemcitabine
    "ace": "ACE",  # Captopril
    "ephx1": "EPHX1",  # Carbamazepine
    "egf": "EGF",  # Cetuximab
    "crhr1": "CRHR1",  # Corticosteroids
    "crhr2": "CRHR2",  # Salbutamol
    "adora2a": "ADORA2A",  # Caffeine
    "ptgs1": "PTGS1",  # Aspirin
    "ltc4s": "LTC4S",  # Aspirin
    "gp1ba": "GP1BA",  # Aspirin
    "ptgfr": "PTGFR",  # Latanoprost
    "c11orf65": "C11orf65",  # Metformin
    "col22a1": "COL22A1",  # Salbutamol
    "gnb3": "GNB3",  # Sildenafil
    "calu": "CALU",  # Warfarin
    "ggcx": "GGCX",  # Warfarin
    "proc": "PROC",  # Warfarin
    "pros1": "PROS1",  # Warfarin
    "abcc2": "ABCC2",  # Various
    "asl": "ASL",  # Valproic acid
    "ass1": "ASS1",  # Valproic acid
    "cps1": "CPS1",  # Valproic acid
    "otc": "OTC",  # Valproic acid
    "abl2": "ABL2",  # Valproic acid
}

# All genes that can be analyzed (for VCF processing)
SUPPORTED_GENES = [
    "CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD",
    "NUDT15", "HLA-B", "HLA-A", "HLA-C", "UGT1A1", "VKORC1", "CYP4F2",
    "CYP2B6", "CYP3A4", "CYP3A5", "CYP2C8", "ABCB1", "ABCG2",
    "G6PD", "MT-RNR1", "CACNA1S", "RYR1", "NAT2", "CFTR",
    "IFNL3", "IFNL4", "POLG", "GBA", "SCN1A", "NAGS",
]

def get_primary_gene_for_drug(drug: str) -> str:
    """Get the primary gene for a drug (lowercase drug name)."""
    return DRUG_TO_PRIMARY_GENE.get(drug.lower())

def get_all_genes_for_drug(drug: str) -> list[str]:
    """Get all genes associated with a drug."""
    drug_lower = drug.lower()
    genes = []
    # Check direct mapping
    if drug_lower in DRUG_TO_PRIMARY_GENE:
        genes.append(DRUG_TO_PRIMARY_GENE[drug_lower])
    # Add multi-gene drugs
    if drug_lower == "warfarin":
        genes.extend(["CYP2C9", "CYP4F2", "VKORC1"])
    elif drug_lower == "azathioprine":
        genes.extend(["TPMT", "NUDT15"])
    elif drug_lower == "carbamazepine":
        genes.extend(["HLA-A", "HLA-B", "SCN1A"])
    elif drug_lower == "phenytoin":
        genes.extend(["CYP2C9", "HLA-B", "SCN1A"])
    return list(set(genes))  # Remove duplicates
