# Installation Instructions

## Prerequisites Check

Before starting, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Python 3.9+** installed ([Download](https://www.python.org/))
- ✅ **npm** (comes with Node.js)
- ✅ **pip** (comes with Python)
- ✅ **Git** (optional, for version control)

## Installation Methods

### Method 1: Automated Setup (Windows PowerShell) - RECOMMENDED

1. **Open PowerShell** in the project directory
2. **Run setup script:**
   ```powershell
   .\setup.ps1
   ```
3. **Configure `.env` file** (see Configuration section below)
4. **Start the application:**
   ```powershell
   .\start-all.ps1
   ```

### Method 2: Manual Setup

#### Step 1: Install Frontend Dependencies

```bash
npm install
```

Expected output: Creates `node_modules/` directory with all React/Next.js dependencies.

#### Step 2: Install Backend Dependencies

**Windows:**
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 3: Configure Environment

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration:

   **Required Settings:**
   ```env
   # LLM API Key (OpenAI or Anthropic)
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-your-key-here
   LLM_MODEL=gpt-4-turbo-preview

   # Encryption Key (generate with command below)
   ENCRYPTION_KEY=<64-character-hex-string>

   # Reference Genome Path
   REFERENCE_FASTA_PATH=C:\path\to\GRCh38.fa
   ```

   **Generate Encryption Key:**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

   **Optional Settings:**
   ```env
   # Liftover Chain (for GRCh37 support)
   LIFTOVER_CHAIN_PATH=C:\path\to\hg19ToHg38.over.chain

   # Development Mode
   SKIP_AUTH=true
   DEBUG=true
   ```

#### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
# Activate virtual environment (if not already active)
.\venv\Scripts\Activate.ps1  # Windows
# or
source venv/bin/activate     # Linux/Mac

# Start FastAPI server
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Verification

After starting both servers:

1. ✅ **Backend Health Check:**
   - Visit: http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

2. ✅ **Backend API Docs:**
   - Visit: http://localhost:8000/docs
   - Should show Swagger UI with available endpoints

3. ✅ **Frontend:**
   - Visit: http://localhost:3000
   - Should show the GeneDose.ai homepage

## Troubleshooting

### npm: command not found
- **Solution:** Install Node.js from https://nodejs.org/
- **Verify:** Run `node --version` and `npm --version`

### python: command not found
- **Solution:** Install Python 3.9+ from https://www.python.org/
- **Windows:** Check "Add Python to PATH" during installation
- **Verify:** Run `python --version`

### pip: command not found
- **Solution:** Install pip: `python -m ensurepip --upgrade`
- **Verify:** Run `pip --version`

### ModuleNotFoundError: No module named 'fastapi'
- **Solution:** Ensure virtual environment is activated
- **Verify:** Run `pip list` to see installed packages
- **Fix:** Run `pip install -r requirements.txt` again

### Port 8000 already in use
- **Solution:** Change backend port in `start-backend.ps1` or command:
  ```bash
  python -m uvicorn main:app --reload --port 8001
  ```
- **Update frontend:** Change API endpoint in `src/components/UploadZone.tsx`

### Port 3000 already in use
- **Solution:** Next.js will automatically use next available port
- **Or specify:** `npm run dev -- -p 3001`

### Backend fails with "ENCRYPTION_KEY not set"
- **Solution:** Add `ENCRYPTION_KEY` to `.env` file
- **Generate:** `python -c "import secrets; print(secrets.token_hex(32))"`

### Backend fails with "LLM_API_KEY not set"
- **Solution:** Add `LLM_API_KEY` to `.env` file
- **Get key:** Sign up at https://platform.openai.com/api-keys

## Next Steps

After successful installation:

1. 📖 Read `QUICK_START.md` for usage instructions
2. 📚 Review `README.md` for architecture overview
3. 🔧 Check `SETUP_GUIDE.md` for advanced configuration
4. 🧪 Test with sample VCF file at http://localhost:3000/analysis

## Production Deployment

For production deployment, see `DEPLOYMENT.md` (if available) or refer to:
- Docker containerization
- Environment variable management
- Database setup (PostgreSQL)
- Redis caching
- SSL/TLS configuration
- Monitoring and logging
