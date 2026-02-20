/**
 * Comprehensive Gene–drug pairs for pharmacogenomics.
 * Includes all drugs from CPIC guidelines and pharmacogenomic evidence.
 * Used by drug-search API and for validation.
 */

export const GENE_DRUG_PAIRS: { gene: string; drug: string; rxnormId?: string; atcIds?: string }[] = [
  // Core 6 drugs
  { gene: 'CYP2D6', drug: 'codeine', rxnormId: '2670', atcIds: 'R05DA04, N02AA59, N02AA79' },
  { gene: 'CYP2C9', drug: 'warfarin', rxnormId: '11289', atcIds: 'B01AA03' },
  { gene: 'CYP4F2', drug: 'warfarin', rxnormId: '11289', atcIds: 'B01AA03' },
  { gene: 'VKORC1', drug: 'warfarin', rxnormId: '11289', atcIds: 'B01AA03' },
  { gene: 'CYP2C19', drug: 'clopidogrel', rxnormId: '32968', atcIds: 'B01AC04' },
  { gene: 'SLCO1B1', drug: 'simvastatin', rxnormId: '36567', atcIds: 'C10AA01, C10BA02, C10BX04, A10BH51, C10BA04, C10BX01' },
  { gene: 'TPMT', drug: 'azathioprine', rxnormId: '1256', atcIds: 'L04AX01' },
  { gene: 'NUDT15', drug: 'azathioprine', rxnormId: '1256', atcIds: 'L04AX01' },
  { gene: 'DPYD', drug: 'fluorouracil', rxnormId: '4492', atcIds: 'L01BC02, L01BC52' },
  
  // CYP2D6 drugs
  { gene: 'CYP2D6', drug: 'tramadol', rxnormId: '10689', atcIds: 'N02AX02' },
  { gene: 'CYP2D6', drug: 'amitriptyline', rxnormId: '704', atcIds: 'N06AA09, N06CA01' },
  { gene: 'CYP2D6', drug: 'atomoxetine', rxnormId: '38400', atcIds: 'N06BA09' },
  { gene: 'CYP2D6', drug: 'tamoxifen', rxnormId: '10324', atcIds: 'L02BA01' },
  { gene: 'CYP2D6', drug: 'paroxetine', rxnormId: '32937', atcIds: 'N06AB05' },
  { gene: 'CYP2D6', drug: 'venlafaxine', rxnormId: '39786', atcIds: 'N06AX16' },
  { gene: 'CYP2D6', drug: 'nortriptyline', rxnormId: '7531', atcIds: 'N06AA10' },
  { gene: 'CYP2D6', drug: 'ondansetron', rxnormId: '26225', atcIds: 'A04AA01' },
  { gene: 'CYP2D6', drug: 'aripiprazole', rxnormId: '89013', atcIds: 'N05AX12' },
  { gene: 'CYP2D6', drug: 'clomipramine', rxnormId: '2597', atcIds: 'N06AA04' },
  { gene: 'CYP2D6', drug: 'desipramine', rxnormId: '3247', atcIds: 'N06AA01' },
  { gene: 'CYP2D6', drug: 'doxepin', rxnormId: '3638', atcIds: 'N06AA12' },
  { gene: 'CYP2D6', drug: 'fluvoxamine', rxnormId: '42355', atcIds: 'N06AB08' },
  { gene: 'CYP2D6', drug: 'hydrocodone', rxnormId: '5489', atcIds: 'R05DA03' },
  { gene: 'CYP2D6', drug: 'imipramine', rxnormId: '5691', atcIds: 'N06AA02' },
  { gene: 'CYP2D6', drug: 'metoprolol', rxnormId: '6918', atcIds: 'C07AB02' },
  { gene: 'CYP2D6', drug: 'risperidone', rxnormId: '35636', atcIds: 'N05AX08' },
  { gene: 'CYP2D6', drug: 'trimipramine', rxnormId: '10834', atcIds: 'N06AA06' },
  { gene: 'CYP2D6', drug: 'oxycodone', rxnormId: '7804', atcIds: 'N02AA05' },
  { gene: 'CYP2D6', drug: 'modafinil', rxnormId: '30125', atcIds: 'N06BA07' },
  { gene: 'CYP2D6', drug: 'methylphenidate', rxnormId: '6901', atcIds: 'N06BA04' },
  { gene: 'CYP2D6', drug: 'terbinafine', rxnormId: '37801', atcIds: 'D01AE15, D01BA02' },
  
  // CYP2C19 drugs
  { gene: 'CYP2C19', drug: 'citalopram', rxnormId: '2556', atcIds: 'N06AB04' },
  { gene: 'CYP2C19', drug: 'escitalopram', rxnormId: '321988', atcIds: 'N06AB10' },
  { gene: 'CYP2C19', drug: 'sertraline', rxnormId: '36437', atcIds: 'N06AB06' },
  { gene: 'CYP2C19', drug: 'voriconazole', rxnormId: '121243', atcIds: 'J02AC03' },
  { gene: 'CYP2C19', drug: 'omeprazole', rxnormId: '7646', atcIds: 'A02BC01' },
  { gene: 'CYP2C19', drug: 'pantoprazole', rxnormId: '40790', atcIds: 'A02BC02' },
  { gene: 'CYP2C19', drug: 'lansoprazole', rxnormId: '17128', atcIds: 'A02BC03' },
  { gene: 'CYP2C19', drug: 'rabeprazole', rxnormId: '114979', atcIds: 'A02BC04' },
  { gene: 'CYP2C19', drug: 'dexlansoprazole', rxnormId: '816346', atcIds: 'A02BC06' },
  { gene: 'CYP2C19', drug: 'esomeprazole', rxnormId: '283742', atcIds: 'A02BC05' },
  { gene: 'CYP2C19', drug: 'brivaracetam', rxnormId: '1739745' },
  { gene: 'CYP2C19', drug: 'carisoprodol', rxnormId: '2101', atcIds: 'M03BA02' },
  { gene: 'CYP2C19', drug: 'clobazam', rxnormId: '21241', atcIds: 'N05BA09' },
  { gene: 'CYP2C19', drug: 'diazepam', rxnormId: '3322', atcIds: 'N05BA01' },
  { gene: 'CYP2C19', drug: 'duloxetine', rxnormId: '72625', atcIds: 'N06AX21' },
  { gene: 'CYP2C19', drug: 'flibanserin', rxnormId: '1665509' },
  
  // CYP2C9 drugs
  { gene: 'CYP2C9', drug: 'phenytoin', rxnormId: '8183', atcIds: 'N03AB02, N03AB52' },
  { gene: 'CYP2C9', drug: 'celecoxib', rxnormId: '140587', atcIds: 'L01XX33, M01AH01' },
  { gene: 'CYP2C9', drug: 'ibuprofen', rxnormId: '5640', atcIds: 'C01EB16, G02CC01, M01AE01, M02AA13' },
  { gene: 'CYP2C9', drug: 'flurbiprofen', rxnormId: '4502', atcIds: 'M01AE09, M02AA19, R02AX01, S01BC04' },
  { gene: 'CYP2C9', drug: 'fosphenytoin', rxnormId: '72236', atcIds: 'N03AB05' },
  { gene: 'CYP2C9', drug: 'lornoxicam', rxnormId: '20890', atcIds: 'M01AC05' },
  { gene: 'CYP2C9', drug: 'meloxicam', rxnormId: '41493', atcIds: 'M01AC06' },
  { gene: 'CYP2C9', drug: 'piroxicam', rxnormId: '8356', atcIds: 'M01AC01' },
  { gene: 'CYP2C9', drug: 'tenoxicam', rxnormId: '37790', atcIds: 'M01AC02' },
  { gene: 'CYP2C9', drug: 'acenocoumarol', rxnormId: '154', atcIds: 'B01AA07' },
  { gene: 'CYP2C9', drug: 'diclofenac', rxnormId: '3355', atcIds: 'D11AX18, M01AB05, M02AA15, S01BC03' },
  { gene: 'CYP2C9', drug: 'indomethacin', rxnormId: '5781', atcIds: 'C01EB03' },
  { gene: 'CYP2C9', drug: 'naproxen', rxnormId: '7258', atcIds: 'M01AE56' },
  { gene: 'CYP2C9', drug: 'aspirin', rxnormId: '1191', atcIds: 'A01AD05, B01AC06, B01AC56, C10BX01, C10BX02, C10BX04, C10BX05, C10BX06, C10BX08, M01BA03, N02BA01, N02BA51, N02BA71' },
  
  // SLCO1B1 drugs (statins)
  { gene: 'SLCO1B1', drug: 'atorvastatin', rxnormId: '83367', atcIds: 'C10AA05' },
  { gene: 'SLCO1B1', drug: 'pravastatin', rxnormId: '42463', atcIds: 'C10AA03' },
  { gene: 'SLCO1B1', drug: 'rosuvastatin', rxnormId: '301542', atcIds: 'C10AA07' },
  { gene: 'SLCO1B1', drug: 'pitavastatin', rxnormId: '861634', atcIds: 'C10AA08' },
  { gene: 'SLCO1B1', drug: 'fluvastatin', rxnormId: '41127', atcIds: 'C10AA04' },
  { gene: 'SLCO1B1', drug: 'lovastatin', rxnormId: '6472', atcIds: 'C10AA02' },
  { gene: 'SLCO1B1', drug: 'methotrexate', rxnormId: '6851', atcIds: 'L01BA01, L04AX03' },
  
  // TPMT drugs
  { gene: 'TPMT', drug: 'mercaptopurine', rxnormId: '103', atcIds: 'L01BB02' },
  { gene: 'TPMT', drug: 'thioguanine', rxnormId: '10485', atcIds: 'L01BB03' },
  
  // DPYD drugs
  { gene: 'DPYD', drug: 'capecitabine', rxnormId: '194000', atcIds: 'L01BC06' },
  { gene: 'DPYD', drug: 'tegafur', rxnormId: '4582', atcIds: 'L01BC03, L01BC53' },
  
  // NUDT15 drugs
  { gene: 'NUDT15', drug: 'mercaptopurine', rxnormId: '103', atcIds: 'L01BB02' },
  { gene: 'NUDT15', drug: 'thioguanine', rxnormId: '10485', atcIds: 'L01BB03' },
  
  // HLA-B drugs
  { gene: 'HLA-B', drug: 'abacavir', rxnormId: '190521', atcIds: 'J05AF06, J05AR02, J05AR13, J05AR04' },
  { gene: 'HLA-B', drug: 'allopurinol', rxnormId: '519', atcIds: 'M04AA01, M04AA51' },
  { gene: 'HLA-B', drug: 'carbamazepine', rxnormId: '2002', atcIds: 'N03AF01' },
  { gene: 'HLA-B', drug: 'fosphenytoin', rxnormId: '72236', atcIds: 'N03AB05' },
  { gene: 'HLA-B', drug: 'phenytoin', rxnormId: '8183', atcIds: 'N03AB02, N03AB52' },
  { gene: 'HLA-B', drug: 'oxcarbazepine', rxnormId: '32624', atcIds: 'N03AF02' },
  { gene: 'HLA-B', drug: 'dapsone', rxnormId: '3108', atcIds: 'D10AX05, J04BA02' },
  { gene: 'HLA-B', drug: 'nevirapine', rxnormId: '53654', atcIds: 'J05AG01' },
  
  // UGT1A1 drugs
  { gene: 'UGT1A1', drug: 'irinotecan', rxnormId: '51499', atcIds: 'L01XX19' },
  { gene: 'UGT1A1', drug: 'atazanavir', rxnormId: '343047', atcIds: 'J05AE08, J05AR15' },
  { gene: 'UGT1A1', drug: 'dolutegravir', rxnormId: '1433868' },
  { gene: 'UGT1A1', drug: 'nilotinib', rxnormId: '662281', atcIds: 'L01XE08' },
  { gene: 'UGT1A1', drug: 'pazopanib', rxnormId: '714438', atcIds: 'L01XE' },
  { gene: 'UGT1A1', drug: 'raltegravir', rxnormId: '719872' },
  { gene: 'UGT1A1', drug: 'belinostat', rxnormId: '1543543' },
  
  // Additional important drugs
  { gene: 'HLA-A', drug: 'allopurinol', rxnormId: '519', atcIds: 'M04AA01, M04AA51' },
  { gene: 'HLA-A', drug: 'carbamazepine', rxnormId: '2002', atcIds: 'N03AF01' },
  { gene: 'HLA-A', drug: 'oxcarbazepine', rxnormId: '32624', atcIds: 'N03AF02' },
  { gene: 'SCN1A', drug: 'carbamazepine', rxnormId: '2002', atcIds: 'N03AF01' },
  { gene: 'SCN1A', drug: 'phenytoin', rxnormId: '8183', atcIds: 'N03AB02, N03AB52' },
  { gene: 'CYP3A5', drug: 'tacrolimus', rxnormId: '42316', atcIds: 'D11AH01, L04AD02' },
  { gene: 'G6PD', drug: 'dapsone', rxnormId: '3108', atcIds: 'D10AX05, J04BA02' },
  { gene: 'G6PD', drug: 'rasburicase', rxnormId: '283821', atcIds: 'M04AX01, V03AF07' },
  { gene: 'G6PD', drug: 'primaquine', rxnormId: '8687', atcIds: 'P01BA03' },
  { gene: 'G6PD', drug: 'nitrofurantoin', rxnormId: '7454', atcIds: 'J01XE01' },
  { gene: 'CFTR', drug: 'ivacaftor', rxnormId: '1243041', atcIds: 'R07AX02, R07AX30' },
  { gene: 'IFNL3', drug: 'peginterferon alfa-2a', rxnormId: '120608', atcIds: 'L03AB11, L03AB61' },
  { gene: 'IFNL4', drug: 'peginterferon alfa-2a', rxnormId: '120608', atcIds: 'L03AB11, L03AB61' },
  { gene: 'IFNL3', drug: 'peginterferon alfa-2b', rxnormId: '253453', atcIds: 'L03AB10, L03AB60' },
  { gene: 'IFNL4', drug: 'peginterferon alfa-2b', rxnormId: '253453', atcIds: 'L03AB10, L03AB60' },
  { gene: 'POLG', drug: 'valproic acid', rxnormId: '11118', atcIds: 'N03AG01' },
  { gene: 'POLG', drug: 'divalproex sodium', rxnormId: '266856' },
  { gene: 'GBA', drug: 'velaglucerase alfa', rxnormId: '901805' },
  { gene: 'NAGS', drug: 'carglumic acid', rxnormId: '401713', atcIds: 'A16AA05' },
  { gene: 'NAGS', drug: 'valproic acid', rxnormId: '11118', atcIds: 'N03AG01' },
]

/** Unique drug names for dropdown/suggestions - expanded list */
export const SUPPORTED_DRUGS_FOR_ANALYSIS = [
  'codeine', 'warfarin', 'clopidogrel', 'simvastatin', 'azathioprine', 'fluorouracil',
  'tramadol', 'amitriptyline', 'citalopram', 'escitalopram', 'sertraline', 'paroxetine',
  'venlafaxine', 'omeprazole', 'pantoprazole', 'phenytoin', 'celecoxib', 'ibuprofen',
  'atorvastatin', 'pravastatin', 'rosuvastatin', 'mercaptopurine', 'capecitabine',
  'abacavir', 'allopurinol', 'carbamazepine', 'irinotecan', 'tacrolimus',
] as const

export function getGenesForDrug(drug: string): string[] {
  const lower = drug.toLowerCase()
  return [...new Set(GENE_DRUG_PAIRS.filter((p) => p.drug.toLowerCase() === lower).map((p) => p.gene))]
}

export function getDrugsForGene(gene: string): string[] {
  const upper = gene.toUpperCase()
  return [...new Set(GENE_DRUG_PAIRS.filter((p) => p.gene.toUpperCase() === upper).map((p) => p.drug))]
}

export function getDrugInfo(drug: string): { rxnormId?: string; atcIds?: string; genes: string[] } | null {
  const lower = drug.toLowerCase()
  const pairs = GENE_DRUG_PAIRS.filter((p) => p.drug.toLowerCase() === lower)
  if (pairs.length === 0) return null
  return {
    rxnormId: pairs[0].rxnormId,
    atcIds: pairs[0].atcIds,
    genes: getGenesForDrug(drug),
  }
}
