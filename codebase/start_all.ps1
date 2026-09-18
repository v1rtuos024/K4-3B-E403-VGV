# Khởi động đồng thời FastAPI Backend (port 8000) và Next.js Frontend (port 3000)
# Tự động kiểm tra và cài đặt đầy đủ thư viện cần thiết trước khi chạy
$OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  🎓 VLearn Spoken-Script QA Studio (FastAPI + Next.js) " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"
$venvDir = Join-Path $PSScriptRoot ".venv"
$pythonExe = Join-Path $venvDir "Scripts\python.exe"

# 1. Kiểm tra / tạo môi trường Python virtualenv
Write-Host "[1/4] Kiểm tra môi trường Python (.venv)..." -ForegroundColor Yellow
if (-not (Test-Path $pythonExe)) {
    Write-Host "  → Đang khởi tạo virtualenv tại $venvDir ..." -ForegroundColor Gray
    try {
        python -m venv $venvDir
    } catch {
        try {
            py -m venv $venvDir
        } catch {
            Write-Host "  ⚠ Không thể tạo .venv. Sẽ dùng python hệ thống..." -ForegroundColor DarkYellow
            $pythonExe = "python"
        }
    }
}

if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

# 2. Cài đặt thư viện Python (requirements.txt)
Write-Host "[2/4] Cài đặt / kiểm tra thư viện Python backend (pip install)..." -ForegroundColor Yellow
$reqFile = Join-Path $backendDir "requirements.txt"
if (Test-Path $reqFile) {
    & $pythonExe -m pip install --quiet -r $reqFile
}

# 3. Cài đặt thư viện Node.js frontend (npm install)
Write-Host "[3/4] Cài đặt / kiểm tra thư viện Node.js frontend (npm install)..." -ForegroundColor Yellow
Push-Location $frontendDir
try {
    npm install
} finally {
    Pop-Location
}

# 4. Khởi chạy FastAPI Backend & Next.js Frontend
Write-Host "[4/4] Đang khởi chạy hệ thống..." -ForegroundColor Green
Write-Host "  → Khởi chạy FastAPI Backend tại http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $backendDir

# Chờ 2s để Backend sẵn sàng
Start-Sleep -Seconds 2

Write-Host "  → Khởi chạy Next.js Frontend tại http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory $frontendDir

Write-Host "`n✓ Hoàn tất! Hãy mở trình duyệt truy cập: http://localhost:3000" -ForegroundColor Green
Write-Host "Cửa sổ dòng lệnh Backend và Frontend đang chạy độc lập." -ForegroundColor Cyan
