# GeneDose.ai - Clinical Decision Support System for Pharmacogenomics

A production-grade Clinical Decision Support System that provides pharmacogenomic recommendations based on VCF file analysis and CPIC guidelines.

## Architecture Overview

GeneDose.ai follows a modular, HIPAA-ready architecture with the following key components:

### Frontend (React + TypeScript)
- **Homepage**: Professional medical interface with secure authentication
- **Navigation**: Clinical workflow-oriented navigation structure
- **Analysis Setup**: VCF file upload with validation and preprocessing
- **Dashboard**: Results visualization with risk categorization

### Backend (Python + FastAPI)
- **VCF Processing**: Validation and normalization of VCF v4.1/v4.2 files
- **Star Allele Calling**: Deterministic allele calling for key pharmacogenes
- **Recommendation Engine**: CPIC Level A & B guideline implementation
- **RAG Layer**: LLM-powered explanations grounded in CPIC guidelines

### Infrastructure
- **Containerization**: Docker-based deployment
- **Security**: HIPAA-compliant data handling
- **Scalability**: <60s processing per sample
- **Monitoring**: Comprehensive logging and error tracking

## Supported Genes

- CYP2D6
- CYP2C19
- CYP2C9
- SLCO1B1
- TPMT
- DPYD

## Risk Categories

- **Safe**: No action required
- **Adjust Dosage**: Dose modification recommended
- **Toxic**: High risk of adverse events
- **Ineffective**: Likely therapeutic failure
- **Unknown**: Insufficient data

## Technical Specifications

- **File Support**: VCF v4.1 and v4.2 (GRCh38)
- **Max File Size**: 5MB
- **Processing Time**: <60 seconds per sample
- **Output Format**: Structured JSON with clinical recommendations

## Security & Compliance

- HIPAA-ready architecture
- No PHI leakage
- Secure data transmission
- Container isolation
- Audit logging

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Docker** (for PharmCAT container - optional for development)
- **bcftools** and **tabix** (for VCF processing)
- **CrossMap** (optional, for GRCh37 liftover)

### Quick Setup (Windows PowerShell)

1. **Run the setup script:**
   ```powershell
   .\setup.ps1
   ```

2. **Configure environment variables:**
   - Edit `.env` file with your API keys:
     - `LLM_API_KEY` (OpenAI or Anthropic)
     - `ENCRYPTION_KEY` (generate with: `python -c "import secrets; print(secrets.token_hex(32))"`)
     - `REFERENCE_FASTA_PATH` (path to GRCh38.fa)

3. **Start the application:**
   ```powershell
   .\start-all.ps1
   ```
   Or start separately:
   - Backend: `.\start-backend.ps1`
   - Frontend: `.\start-frontend.ps1` (in a new terminal)

### Manual Setup

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Environment Configuration

Create a `.env` file (copy from `.env.example`):
```env
# LLM Configuration (required for explanations)
LLM_PROVIDER=openai
LLM_API_KEY=your-openai-api-key-here
LLM_MODEL=gpt-4-turbo-preview

# File Encryption (required for secure storage)
ENCRYPTION_KEY=your-64-hex-character-encryption-key-here

# Reference Genome (required for VCF normalization)
REFERENCE_FASTA_PATH=/path/to/GRCh38.fa

# Liftover Chain (optional, for GRCh37 support)
LIFTOVER_CHAIN_PATH=/path/to/hg19ToHg38.over.chain

# Development Settings
SKIP_AUTH=true
DEBUG=true
```

## Development

### Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

### Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Testing

- **Frontend:** `npm test` (if configured)
- **Backend:** `pytest` (from backend directory)

## License

Medical Software License - See LICENSE file for details
