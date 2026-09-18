@echo off
chcp 65001 > nul
echo ====================================================
echo   🎓 VLearn Spoken-Script QA Studio (FastAPI + Next.js)
echo ====================================================

set SCRIPT_DIR=%~dp0
set VENV_DIR=%SCRIPT_DIR%.venv
set PYTHON_EXE=%VENV_DIR%\Scripts\python.exe

echo [1/4] Kiểm tra môi trường Python (.venv)...
if not exist "%PYTHON_EXE%" (
    echo   → Đang tạo môi trường ảo Python (.venv)...
    python -m venv "%VENV_DIR%" 2>nul
    if not exist "%PYTHON_EXE%" (
        py -m venv "%VENV_DIR%" 2>nul
    )
)

if not exist "%PYTHON_EXE%" (
    echo   ⚠ Không tìm thấy .venv, sử dụng python hệ thống...
    set PYTHON_EXE=python
)

echo [2/4] Cài đặt thư viện Python backend (pip install -r requirements.txt)...
"%PYTHON_EXE%" -m pip install --quiet -r "%SCRIPT_DIR%backend\requirements.txt"

echo [3/4] Cài đặt thư viện Node.js frontend (npm install)...
cd /d "%SCRIPT_DIR%frontend"
call npm install
cd /d "%SCRIPT_DIR%"

echo [4/4] Khởi chạy đồng thời Backend và Frontend...
echo   → Khởi chạy FastAPI Backend (port 8000)...
start "VLearn Backend (FastAPI)" cmd /k "cd /d "%SCRIPT_DIR%backend" && "%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo   → Khởi chạy Next.js Frontend (port 3000)...
start "VLearn Frontend (Next.js)" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ✓ Hệ thống đã sẵn sàng!
echo Mở trình duyệt tại: http://localhost:3000
echo ====================================================
pause
