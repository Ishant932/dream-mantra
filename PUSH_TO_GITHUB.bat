@echo off
title Dream Mantra - Push to GitHub
cd /d "%~dp0"

echo.
echo ============================================
echo   Dream Mantra - Upload to NEW GitHub Repo
echo ============================================
echo.

where gh >nul 2>&1
if errorlevel 1 (
  echo GitHub CLI not found. Install from: https://cli.github.com/
  pause
  exit /b 1
)

gh auth status >nul 2>&1
if errorlevel 1 (
  echo Step 1: Log in to GitHub ^(browser will open^)
  gh auth login -h github.com -p https -w
)

echo.
echo Step 2: Create NEW private repo and push
echo Repo name will be: dream-mantra
echo.

gh repo create dream-mantra --private --source=. --remote=origin --push --description "Dream Mantra - Education and Career Counselling Platform"

if errorlevel 1 (
  echo.
  echo If repo name already exists, try:
  echo   gh repo create dream-mantra-app --private --source=. --remote=origin --push
  pause
  exit /b 1
)

echo.
echo Done! Your code is on GitHub.
gh repo view --web
pause
