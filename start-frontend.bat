@echo off
echo ============================================
echo   Starting Agentic AI Investment Frontend
echo ============================================
cd /d "%~dp0frontend"
echo Running from: %CD%
echo.
npm run dev
pause
