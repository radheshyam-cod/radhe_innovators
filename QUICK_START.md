# Quick Start Guide

## Windows PowerShell Setup

### Step 1: Install Dependencies

Run the automated setup script:
```powershell
.\setup.ps1
```

This will:
- ✓ Check Node.js, npm, Python, pip installations
- ✓ Install frontend dependencies (npm install)
- ✓ Create Python virtual environment
- ✓ Install backend dependencies (pip install -r requirements.txt)
- ✓ Create .env file from template

### Step 2: Configure Environment

Edit `.env` file with your credentials:

**Required:**
```env
LLM_API_KEY=sk-your-openai-key-here
ENCRYPTION_KEY=<generate-with-command-below>
REFERENCE_FASTA_PATH=C:\path\to\GRCh38.fa
```

**Generate Encryption Key:**
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

**Optional (for production):**
```env
LIFTOVER_CHAIN_PATH=C:\path\to\hg19ToHg38.over.chain
PHARMCAT_CONTAINER=pharmcat/pharmcat:latest
```

### Step 3: Start Application

**Option A: Start Both Servers (Recommended)**
```powershell
.\start-all.ps1
```

**Option B: Start Separately**

Terminal 1 - Backend:
```powershell
.\start-backend.ps1
```

Terminal 2 - Frontend:
```powershell
.\start-frontend.ps1
```

### Step 4: Access Application

- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:8000
- 📚 **API Docs:** http://localhost:8000/docs

## Troubleshooting

### npm not found
- Install Node.js from https://nodejs.org/
- Restart PowerShell after installation

### Python not found
- Install Python 3.9+ from https://www.python.org/
- Check "Add Python to PATH" during installation
- Restart PowerShell after installation

### Backend fails to start
- Check `.env` file exists and has required keys
- Verify virtual environment: `venv\Scripts\Activate.ps1`
- Check Python dependencies: `pip list`

### Frontend fails to start
- Verify node_modules exists: `ls node_modules`
- Reinstall if needed: `npm install`

### Port already in use
- Change ports in:
  - Backend: `backend/main.py` or `start-backend.ps1`
  - Frontend: `package.json` scripts or `next.config.mjs`

## Next Steps

1. Upload a VCF file at http://localhost:3000/analysis
2. Select a drug (CODEINE, WARFARIN, CLOPIDOGREL, etc.)
3. View pharmacogenomic analysis results
4. Download JSON results or copy to clipboard

For detailed setup, see `SETUP_GUIDE.md` or `README.md`.
