# Start Backend Server

Write-Host "Starting GeneDose.ai Backend Server..." -ForegroundColor Cyan

# Activate virtual environment
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "✗ Virtual environment not found. Run setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠ Warning: .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env created. Please configure it before continuing." -ForegroundColor Yellow
    }
}

# Start backend
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
