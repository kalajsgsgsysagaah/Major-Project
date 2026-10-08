@echo off
echo ============================================
echo   Starting Agentic AI Investment Backend
echo ============================================
cd /d "%~dp0backend"
echo Running from: %CD%
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
