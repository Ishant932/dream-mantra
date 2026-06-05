@echo off
title Dream Mantra - MongoDB Atlas Setup
cd /d "%~dp0\.."

echo.
echo ============================================
echo   MongoDB Atlas - Automated Setup
echo   Dream Mantra
echo ============================================
echo.
echo Opening MongoDB Atlas Applications page...
echo   (API Keys moved here — old apiKeys link may show an error)
echo.
echo   1. Left sidebar: Identity and Access -^> Applications
echo   2. Click "Add new API Key"
echo   3. Description: dream-mantra-setup
echo   4. Permission: Organization Project Creator
echo   5. Copy Public Key + Private Key
echo.
start https://cloud.mongodb.com
timeout /t 2 >nul

echo Paste ATLAS PUBLIC KEY:
set /p ATLAS_PUBLIC_KEY=
echo Paste ATLAS PRIVATE KEY:
set /p ATLAS_PRIVATE_KEY=
echo.
echo Paste RENDER API KEY (rnd_... or press Enter to skip):
set /p RENDER_API_KEY=

echo.
echo Running setup (cluster creation takes 3-5 minutes)...
echo.

if defined RENDER_API_KEY (
  set RENDER_API_KEY=%RENDER_API_KEY%
)
node scripts/setup-atlas.js

echo.
pause
