# GeneDose.ai - Technical Specification

## System Overview

GeneDose.ai is a production-grade Clinical Decision Support System (CDSS) for pharmacogenomics that processes VCF files and provides evidence-based drug recommendations based on CPIC guidelines.

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS with custom medical theme
- **UI Components**: Custom components with Lucide icons
- **Forms**: React Hook Form with Zod validation
- **File Upload**: React Dropzone
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite

### Backend (Python + FastAPI)
- **Framework**: FastAPI with async support
- **Genomics**: pysam, cyvcf2 for VCF processing
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for performance optimization
- **Security**: JWT authentication, CORS, rate limiting
- **Logging**: Structured logging with structlog
- **Monitoring**: Prometheus metrics, health checks

### Infrastructure
- **Containerization**: Docker multi-stage builds
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx (production)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Health Monitoring**: Custom health endpoints

## Core Components

### 1. VCF Processing Pipeline
```python
# VCF File Validation
- File size limit: 5MB
- Format validation: VCF v4.1/v4.2
- Reference genome: GRCh38
- Compression: Support for .vcf.gz

# Quality Control
- Header validation
- Sample consistency checks
- Variant quality filters
- Contamination detection
```

### 2. Star Allele Calling Engine
```python
# Supported Genes
SUPPORTED_GENES = [
    'CYP2D6',    # Cytochrome P450 2D6
    'CYP2C19',   # Cytochrome P450 2C19
    'CYP2C9',    # Cytochrome P450 2C9
    'SLCO1B1',   # Solute Carrier Organic Anion Transporter
    'TPMT',       # Thiopurine Methyltransferase
    'DPYD'        # Dihydropyrimidine Dehydrogenase
]

# Allele Definition Database
- PharmCAT reference definitions
- Custom allele mappings
- Activity score calculations
- Phenotype determination
```

### 3. CPIC Recommendation Engine
```python
# Guideline Processing
- CPIC Level A & B guidelines
- Drug-gene pairs
- Phenotype-based recommendations
- Evidence strength classification

# Risk Categorization
RISK_CATEGORIES = {
    'safe': 'No action required',
    'adjust': 'Dose modification needed',
    'toxic': 'High adverse event risk',
    'ineffective': 'Therapeutic failure likely',
    'unknown': 'Insufficient data'
}

# Output Format
{
    "gene": "CYP2D6",
    "star_alleles": ["*1", "*4"],
    "activity_score": 1.0,
    "phenotype": "Intermediate Metabolizer",
    "risk_category": "adjust",
    "recommendations": [...]
}
```

### 4. RAG Explanation Layer
```python
# Knowledge Base
- CPIC guideline texts
- FDA drug labels
- Clinical literature
- Pharmacogenomics resources

# LLM Integration
- Retrieval-Augmented Generation
- Context-aware explanations
- Evidence citation
- Clinical language adaptation
```

## API Endpoints

### Core Analysis
```
POST /api/analyze
- Upload VCF file
- Patient metadata
- Return complete analysis

GET /api/analysis/{id}
- Retrieve previous analysis
- Results caching

GET /api/supported-genes
- List supported pharmacogenes
- Gene descriptions
```

### Reference Data
```
GET /api/guidelines/{gene}
- CPIC guidelines by gene
- Drug recommendations
- Evidence levels

GET /api/alleles/{gene}
- Star allele definitions
- Activity scores
- Phenotype mappings
```

### System Management
```
GET /health
- Service health status
- Component checks
- Performance metrics

GET /metrics
- Prometheus metrics
- Processing statistics
- Error rates
```

## Data Models

### Analysis Request
```typescript
interface AnalysisRequest {
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  clinicalNotes?: string;
  vcfFile: File;
}
```

### Analysis Response
```typescript
interface AnalysisResponse {
  analysisId: string;
  patientId: string;
  geneAnalyses: GeneAnalysis[];
  summary: {
    totalGenes: number;
    riskDistribution: Record<RiskCategory, number>;
    highRiskGenes: string[];
    processingTimeSeconds: number;
  };
  createdAt: Date;
  processingTimeSeconds: number;
  status: 'completed' | 'error';
}
```

### Gene Analysis
```typescript
interface GeneAnalysis {
  gene: string;
  starAlleles: string[];
  activityScore?: number;
  phenotype: string;
  riskCategory: RiskCategory;
  recommendations: Recommendation[];
}
```

### Recommendation
```typescript
interface Recommendation {
  drug: string;
  level: 'A' | 'B';
  recommendation: string;
  evidence: string;
  action: string;
  explanation?: string;
}
```

## Security & Compliance

### HIPAA Compliance
- **Data Encryption**: TLS 1.3 for transmission, AES-256 at rest
- **Access Control**: Role-based authentication (RBAC)
- **Audit Logging**: Comprehensive access logs
- **Data Retention**: Configurable retention policies
- **Breach Detection**: Automated monitoring and alerts

### Authentication & Authorization
```python
# JWT Token Structure
{
    "sub": "user_id",
    "role": "clinician|researcher|admin",
    "org": "organization_id",
    "exp": "expiration_timestamp",
    "iat": "issued_at"
}

# Role-Based Access
CLINICIAN: Full patient analysis access
RESEARCHER: De-identified data access
ADMIN: System administration
```

### Data Privacy
- **PHI Protection**: No PHI in logs or monitoring
- **Anonymization**: Optional data anonymization
- **Consent Management**: Patient consent tracking
- **Data Minimization**: Only necessary data collection

## Performance Requirements

### Processing Time
- **Target**: <60 seconds per sample
- **VCF Validation**: <5 seconds
- **Star Allele Calling**: <30 seconds
- **Recommendation Generation**: <20 seconds
- **RAG Explanations**: <5 seconds

### Scalability
- **Concurrent Users**: 100+ simultaneous analyses
- **Throughput**: 1000+ analyses per day
- **Storage**: Scalable file storage (S3 compatible)
- **Database**: Horizontal scaling support

### Reliability
- **Uptime**: 99.9% availability
- **Error Rate**: <0.1% for critical operations
- **Recovery**: <5 minute recovery time
- **Backups**: Automated daily backups

## Monitoring & Observability

### Metrics
```python
# Processing Metrics
- Analysis completion rate
- Average processing time
- Error rates by component
- File validation failures

# System Metrics
- CPU and memory usage
- Database connection pool
- Cache hit rates
- API response times

# Business Metrics
- User adoption rates
- Gene analysis frequency
- Risk category distribution
- Clinical outcome tracking
```

### Logging
```python
# Structured Logging Format
{
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "INFO",
    "service": "vcf_processor",
    "user_id": "user_123",
    "analysis_id": "analysis_456",
    "gene": "CYP2D6",
    "duration_ms": 1250,
    "status": "success"
}
```

### Alerting
- **Critical**: Service downtime, data corruption
- **Warning**: High error rates, slow processing
- **Info**: System updates, maintenance

## Deployment Architecture

### Development Environment
```yaml
# docker-compose.dev.yml
- Frontend: Vite dev server (port 3000)
- Backend: FastAPI with auto-reload (port 8000)
- Database: PostgreSQL 15 (port 5432)
- Cache: Redis 7 (port 6379)
```

### Production Environment
```yaml
# docker-compose.prod.yml
- Load Balancer: Nginx
- Frontend: Static files served by Nginx
- Backend: Gunicorn + FastAPI (multiple workers)
- Database: PostgreSQL with connection pooling
- Cache: Redis with persistence
- Monitoring: Prometheus + Grafana
```

## Testing Strategy

### Unit Tests
- **Frontend**: Jest + React Testing Library
- **Backend**: pytest with async support
- **Coverage**: >90% code coverage

### Integration Tests
- **API Testing**: Full endpoint testing
- **Database Testing**: Migration and query testing
- **File Processing**: VCF validation and processing

### End-to-End Tests
- **User Workflows**: Complete analysis flows
- **Browser Testing**: Cross-browser compatibility
- **Performance Testing**: Load and stress testing

### Clinical Validation
- **Test Cases**: Known genotype-phenotype pairs
- **Guideline Validation**: CPIC guideline compliance
- **Clinical Review**: Expert clinician validation

## Documentation

### Technical Documentation
- **API Documentation**: OpenAPI/Swagger
- **Code Documentation**: Comprehensive inline docs
- **Architecture Documentation**: System design docs
- **Deployment Guides**: Step-by-step instructions

### Clinical Documentation
- **User Manual**: Clinician user guide
- **Interpretation Guide**: Result interpretation
- **Clinical Evidence**: Supporting literature
- **Training Materials**: Educational content

## Future Enhancements

### Phase 2 Features
- **Additional Genes**: Expand to 20+ pharmacogenes
- **Drug-Drug Interactions**: Multi-drug analysis
- **Population Data**: Ethnicity-specific data
- **Mobile App**: iOS/Android applications

### Advanced Analytics
- **Machine Learning**: Predictive models
- **Population Health**: Aggregate analysis
- **Clinical Trials**: Research integration
- **Real-world Evidence**: Outcome tracking

### Integration Capabilities
- **EHR Integration**: HL7 FHIR support
- **Lab Systems**: LIS integration
- **Pharmacy Systems**: e-prescribing integration
- **Decision Support**: EHR-embedded recommendations
