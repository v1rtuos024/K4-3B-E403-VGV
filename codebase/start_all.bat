@echo off
chcp 65001 > nul
echo ====================================================
echo   🎓 VLearn Spoken-Script QA Studio (FastAPI + Next.js)
echo ====================================================

set SCRIPT_DIR=%~dp0
set PYTHON_EXE=%SCRIPT_DIR%.venv\Scripts\python.exe

echo [1/2] Đang khởi chạy FastAPI Backend (port 8000)...
start "VLearn Backend (FastAPI)" cmd /k "cd /d "%SCRIPT_DIR%backend" && "%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo [2/2] Đang khởi chạy Next.js Frontend (port 3000)...
start "VLearn Frontend (Next.js)" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ✓ Hệ thống đã sẵn sàng!
echo Mở trình duyệt tại: http://localhost:3000
echo ====================================================
pause
