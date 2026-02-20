export interface RiskCategory {
  SAFE: 'safe'
  ADJUST: 'adjust'
  TOXIC: 'toxic'
  INEFFECTIVE: 'ineffective'
  UNKNOWN: 'unknown'
}

export interface Severity {
  LOW: 'low'
  MEDIUM: 'medium'
  HIGH: 'high'
  CRITICAL: 'critical'
}

export interface StarAllele {
  gene: string
  allele: string
  position?: string
  reference?: string
  alternate?: string
  zygosity: 'homozygous' | 'heterozygous'
  confidence: number
}

export interface ActivityScore {
  gene: string
  score: number
  calculation_method: string
  alleles_considered: string[]
  phenotype: string
}

export interface Recommendation {
  drug: string
  gene: string
  level: 'A' | 'B'
  recommendation: string
  action: string
  evidence: string
  explanation?: string
  risk_category: RiskCategory[keyof RiskCategory]
  citations: string[]
}

export interface GeneAnalysis {
  gene: string
  star_alleles: StarAllele[]
  activity_score?: ActivityScore
  phenotype: string
  risk_category: RiskCategory[keyof RiskCategory]
  recommendations: Recommendation[]
  processing_time_ms: number
  confidence_score: number
}

export interface AnalysisRequest {
  patient_id: string
  patient_name: string
  date_of_birth: string
  clinical_notes?: string
  vcf_file_id: string
}

export interface AnalysisResponse {
  analysis_id: string
  patient_id: string
  patient_name: string
  date_of_birth: string
  clinical_notes?: string
  gene_analyses: GeneAnalysis[]
  summary: {
    total_genes: number
    risk_distribution: Record<RiskCategory[keyof RiskCategory], number>
    high_risk_genes: string[]
    processing_time_seconds: number
    variant_count: number
    genome_build: string
    quality_score: number
  }
  created_at: string
  processing_time_seconds: number
  status: 'completed' | 'processing' | 'error'
}

export interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  genome_build?: string
  variant_count: number
  quality_score: number
  file_size_mb: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'clinician' | 'pharmacist' | 'researcher' | 'admin'
  created_at: string
  last_login?: string
}

export interface DrugSearchRequest {
  query: string
  include_guidelines: boolean
  gene_filter?: string[]
}

export interface DrugSearchResult {
  drug_name: string
  relevant_genes: string[]
  guidelines: any[]
  summary: string
}

export interface PatientWalletCard {
  patient_id: string
  patient_name: string
  date_of_birth: string
  critical_interactions: any[]
  emergency_contact?: string
  generated_at: string
  qr_code: string
}

export interface ProcessingStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  current_step: string
  estimated_completion?: string
  error_message?: string
}

export interface CPICGuideline {
  gene: string
  drug: string
  level: 'A' | 'B'
  guideline_url: string
  recommendation_text: string
  evidence_summary: string
  last_updated: string
}

export interface UploadProgress {
  stage: 'uploading' | 'validating' | 'processing' | 'analyzing' | 'completed'
  progress: number
  message: string
  error?: string
}
