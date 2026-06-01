# Dream Mantra -> GitHub (DreamsMantra account)
# Run: powershell -ExecutionPolicy Bypass -File UPLOAD_TO_DREAMSMANTRA.ps1

$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Upload to GitHub: DreamsMantra / dream-mantra"
Write-Host "Account: eshalohiya45@gmail.com"
Write-Host ""

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Install GitHub CLI from https://cli.github.com/"
  exit 1
}

gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Opening browser - log in with eshalohiya45@gmail.com ..."
  gh auth login -h github.com -p https -w
}

$repo = "DreamsMantra/dream-mantra"
gh repo view $repo 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creating private repo: $repo"
  gh repo create dream-mantra --private --description "Dream Mantra platform" --confirm
}

git remote remove origin 2>$null
git remote add origin "https://github.com/$repo.git"

Write-Host "Pushing code..."
git push -u origin main --force

Write-Host ""
Write-Host "Done: https://github.com/$repo"
Start-Process "https://github.com/$repo"
