-- GeneDose.ai Database Initialization Script

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS genedose;

-- Use the genedose database
\c genedose;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
    analysis_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    clinical_notes TEXT,
    vcf_file_id VARCHAR(50) NOT NULL,
    gene_analyses JSONB NOT NULL,
    summary JSONB NOT NULL,
    processing_time_seconds FLOAT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vcf_files table
CREATE TABLE IF NOT EXISTS vcf_files (
    file_id VARCHAR(50) PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    genome_build VARCHAR(20),
    variant_count INTEGER,
    quality_score FLOAT,
    validation_results JSONB,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL
);

-- Create gene_analyses table (for detailed storage)
CREATE TABLE IF NOT EXISTS gene_analyses (
    id SERIAL PRIMARY KEY,
    analysis_id VARCHAR(50) REFERENCES analyses(analysis_id),
    gene VARCHAR(50) NOT NULL,
    star_alleles JSONB NOT NULL,
    activity_score JSONB,
    phenotype VARCHAR(100) NOT NULL,
    risk_category VARCHAR(50) NOT NULL,
    recommendations JSONB NOT NULL,
    processing_time_ms FLOAT NOT NULL,
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cpic_guidelines table (for caching)
CREATE TABLE IF NOT EXISTS cpic_guidelines (
    id SERIAL PRIMARY KEY,
    gene VARCHAR(50) NOT NULL,
    drug VARCHAR(255) NOT NULL,
    level VARCHAR(10) NOT NULL,
    guideline_url VARCHAR(500),
    recommendation_text TEXT,
    evidence_summary TEXT,
    last_updated DATE,
    UNIQUE(gene, drug)
);

-- Create analysis_cache table (for performance)
CREATE TABLE IF NOT EXISTS analysis_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_patient_id ON analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_vcf_files_status ON vcf_files(status);
CREATE INDEX IF NOT EXISTS idx_gene_analyses_gene ON gene_analyses(gene);
CREATE INDEX IF NOT EXISTS idx_gene_analyses_risk ON gene_analyses(risk_category);
CREATE INDEX IF NOT EXISTS idx_cpic_guidelines_gene_drug ON cpic_guidelines(gene, drug);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON analysis_cache(expires_at);

-- Insert sample users (for development)
INSERT INTO users (id, email, name, role, hashed_password) VALUES
('user_001', 'clinician@example.com', 'Dr. Sarah Chen', 'clinician', '$2b$12$LQv3c1yqBWVHxkd0LdNuGvKxlM.3rLjNqKwzCp5ZQqLz5qEj3e'),
('user_002', 'pharmacist@example.com', 'Dr. Michael Park', 'pharmacist', '$2b$12$LQv3c1yqBWVHxkd0LdNuGvKxlM.3rLjNqKwzCp5ZQqLz5qEj3e')
ON CONFLICT DO NOTHING;

-- Insert sample CPIC guidelines (for development)
INSERT INTO cpic_guidelines (gene, drug, level, recommendation_text, evidence_summary, last_updated) VALUES
('CYP2D6', 'codeine', 'A', 'Avoid codeine use in CYP2D6 ultrarapid metabolizers due to risk of toxicity. Consider alternative analgesics in poor metabolizers due to reduced efficacy.', 'CPIC Guideline for Codeine Therapy and CYP2D6 Genotype (2020)', '2023-01-01'),
('CYP2C19', 'clopidogrel', 'A', 'Avoid clopidogrel in CYP2C19 poor metabolizers. Consider alternative antiplatelet agents such as prasugrel or ticagrelor.', 'CPIC Guideline for Clopidogrel Therapy and CYP2C19 Genotype (2022)', '2023-01-01'),
('CYP2C9', 'warfarin', 'A', 'Reduce warfarin starting dose by 90-95% in CYP2C9 poor metabolizers. Monitor INR closely.', 'CPIC Guideline for Warfarin Therapy and CYP2C9/VKORC1 Genotypes (2017)', '2023-01-01'),
('SLCO1B1', 'simvastatin', 'A', 'Avoid simvastatin doses >40mg daily in SLCO1B1 poor transporters. Consider alternative statins.', 'CPIC Guideline for Statin Therapy and SLCO1B1 Genotype (2022)', '2023-01-01'),
('TPMT', 'azathioprine', 'A', 'Reduce azathioprine starting dose by 90% in TPMT-deficient patients. Monitor blood counts closely.', 'CPIC Guideline for Thiopurine Therapy and TPMT Genotype (2019)', '2023-01-01'),
('DPYD', 'fluorouracil', 'A', 'Avoid fluorouracil in DPYD-deficient patients. Consider alternative chemotherapy agents.', 'CPIC Guideline for Fluoropyrimidine Therapy and DPYD Genotype (2022)', '2023-01-01')
ON CONFLICT DO NOTHING;

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO genedose;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO genedose;
