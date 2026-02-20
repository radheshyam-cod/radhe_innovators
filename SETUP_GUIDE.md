# GeneDose.ai Setup Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Docker** (for PharmCAT container)
- **bcftools** and **tabix** (for VCF processing)
- **CrossMap** (optional, for GRCh37 liftover)

## Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

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

# PharmCAT Container
PHARMCAT_CONTAINER=pharmcat/pharmcat:latest

# Development Settings
SKIP_AUTH=true
DEBUG=true
```

### 4. Generate Encryption Key

```bash
# Python one-liner to generate 64-character hex key
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Production Deployment

See `DEPLOYMENT.md` for production setup instructions.
