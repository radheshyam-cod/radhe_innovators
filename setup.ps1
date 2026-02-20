# GeneDose.ai Setup Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GeneDose.ai Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please install Node.js (includes npm)" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.9+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Check pip
Write-Host "Checking pip installation..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version
    Write-Host "✓ pip found" -ForegroundColor Green
} catch {
    Write-Host "✗ pip not found. Please install pip" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Setting up Python Virtual Environment..." -ForegroundColor Cyan
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists, skipping creation" -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Activating Virtual Environment and Installing Backend Dependencies..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend dependency installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Creating .env file from template..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host ".env file already exists, skipping creation" -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please edit it with your API keys and configuration" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your configuration:" -ForegroundColor White
Write-Host "   - LLM_API_KEY (OpenAI or Anthropic)" -ForegroundColor Gray
Write-Host "   - ENCRYPTION_KEY (run: python -c 'import secrets; print(secrets.token_hex(32))')" -ForegroundColor Gray
Write-Host "   - REFERENCE_FASTA_PATH (path to GRCh38.fa)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Backend Server:" -ForegroundColor White
Write-Host "   venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Frontend Server (new terminal):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Access Application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
