@echo off
title Dream Mantra - Deploy to Render
cd /d "%~dp0"

echo.
echo ============================================
echo   Deploy Dream Mantra to Render
echo   Account: eshalohiya45@gmail.com
echo ============================================
echo.
echo Step 1: Get API key (one time)
echo   Opening: https://dashboard.render.com/u/settings#api-keys
echo   Click "Create API Key" and copy it.
echo.
start https://dashboard.render.com/u/settings#api-keys
timeout /t 3 >nul

echo Step 2: Paste API key below and press Enter
set /p RENDER_API_KEY=Render API Key: 

if "%RENDER_API_KEY%"=="" (
  echo No key entered. Exiting.
  pause
  exit /b 1
)

echo.
set /p GEMINI_API_KEY=Gemini API Key (optional, press Enter to skip): 
set /p ADMIN_PASSWORD=Admin password for live site (optional): 

echo.
echo Deploying...
node scripts/deploy-render.js

echo.
pause
