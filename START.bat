@echo off
title Dreams Mantra
cd /d "%~dp0"

echo.
echo  ========================================
echo   Dreams Mantra - Starting...
echo  ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  ERROR: Node.js is not installed.
  echo  Download from https://nodejs.org then run this again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  First-time setup: installing packages...
  call npm run install:all
)

echo  Dev mode: http://localhost:5174  API http://localhost:5001
start http://localhost:5174/login
npm run dev
pause
