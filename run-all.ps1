$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendScript = Join-Path $projectRoot "run-backend.ps1"
$frontendScript = Join-Path $projectRoot "run-frontend.ps1"

if (-not (Test-Path $backendScript)) {
    throw "No se encontro run-backend.ps1 en la raiz del proyecto."
}

if (-not (Test-Path $frontendScript)) {
    throw "No se encontro run-frontend.ps1 en la raiz del proyecto."
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $backendScript
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $frontendScript
)

Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
