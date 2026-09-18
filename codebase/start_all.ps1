# Khởi động đồng thời FastAPI Backend (port 8000) và Next.js Frontend (port 3000)
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  🎓 VLearn Spoken-Script QA Studio (FastAPI + Next.js) " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"
$pythonExe = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

# 1. Khởi chạy FastAPI Backend
Write-Host "[1/2] Đang khởi chạy FastAPI Backend tại http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $backendDir

# Chờ 2s để Backend sẵn sàng
Start-Sleep -Seconds 2

# 2. Khởi chạy Next.js Frontend
Write-Host "[2/2] Đang khởi chạy Next.js Frontend tại http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory $frontendDir

Write-Host "`n✓ Hoàn tất! Hãy mở trình duyệt truy cập: http://localhost:3000" -ForegroundColor Green
Write-Host "Cửa sổ dòng lệnh Backend và Frontend đang chạy độc lập." -ForegroundColor Cyan
