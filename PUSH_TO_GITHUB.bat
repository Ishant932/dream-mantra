@echo off
title Dream Mantra - Push to DreamsMantra GitHub
cd /d "%~dp0"

echo.
echo ============================================
echo   Upload to GitHub: DreamsMantra account
echo   (eshalohiya45@gmail.com)
echo ============================================
echo.

where gh >nul 2>&1
if errorlevel 1 (
  echo Install GitHub CLI: https://cli.github.com/
  pause
  exit /b 1
)

gh auth status >nul 2>&1
if errorlevel 1 (
  echo Log in with eshalohiya45@gmail.com when browser opens...
  gh auth login -h github.com -p https -w
)

echo.
echo Pushing to https://github.com/DreamsMantra/DreamsMantra
git push -u origin main --force

echo.
gh repo view DreamsMantra/DreamsMantra --web
pause
