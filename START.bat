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

echo  Choose mode:
echo    1 = Development  (http://localhost:5173)
echo    2 = Production   (http://localhost:5000 - one link)
echo.
set /p MODE="Enter 1 or 2 [default 2]: "
if "%MODE%"=="" set MODE=2
if "%MODE%"=="1" goto DEV
goto PROD

:DEV
echo.
echo  Dev mode: website http://localhost:5173  API http://localhost:5000
start http://localhost:5173
npm run dev
goto END

:PROD
echo.
echo  Building website...
call npm run build
if errorlevel 1 (
  echo  Build failed.
  pause
  exit /b 1
)
echo.
echo  Opening http://localhost:5000 in your browser...
start http://localhost:5000
cd backend
node index.js
goto END

:END
pause
