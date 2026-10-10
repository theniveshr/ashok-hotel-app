# Ashok Raj Lodge & Restaurant — Local Setup Helper
Write-Host "=== Ashok Raj Hospitality System — Local Setup ===" -ForegroundColor Cyan

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVer = node -v
    Write-Host " Node.js: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node 20+" -ForegroundColor Red
}

# Copy .env if not present
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host " Created root .env from .env.example" -ForegroundColor Yellow
}

if (-not (Test-Path "backend/api/.env")) {
    Copy-Item ".env.example" "backend/api/.env"
    Write-Host " Created backend/api/.env from .env.example" -ForegroundColor Yellow
}

Write-Host "`nTo install dependencies and start:" -ForegroundColor Cyan
Write-Host "  1. npm install"
Write-Host "  2. npm run db:migrate"
Write-Host "  3. npm run db:seed"
Write-Host "  4. npm run dev"
