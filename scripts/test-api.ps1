# API Testing PowerShell Script
# Run this to test all API endpoints
# Usage: .\scripts\test-api.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Lead Generation MVP - API Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if server is running
$url = "http://localhost:3000"
Write-Host "Checking if server is running at $url..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$url/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Server is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running!" -ForegroundColor Red
    Write-Host "Please start the development server first:" -ForegroundColor Yellow
    Write-Host "  npm run dev`n" -ForegroundColor White
    exit 1
}

# Run Node.js test script
Write-Host "`nRunning API tests...`n" -ForegroundColor Yellow
node scripts/test-api.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ All tests completed!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Tests failed!" -ForegroundColor Red
}
