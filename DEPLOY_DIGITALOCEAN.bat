@echo off
REM Deploy Dream Mantra to DigitalOcean App Platform
REM Set token first: set DIGITALOCEAN_ACCESS_TOKEN=dop_v1_...
if "%DIGITALOCEAN_ACCESS_TOKEN%"=="" (
  echo Missing DIGITALOCEAN_ACCESS_TOKEN
  echo Create: https://cloud.digitalocean.com/account/api/tokens
  exit /b 1
)
node scripts/deploy-digitalocean.js
