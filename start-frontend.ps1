# Start Frontend Server

Write-Host "Starting GeneDose.ai Frontend Server..." -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠ node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Next.js development server on http://localhost:3000" -ForegroundColor Green
npm run dev
