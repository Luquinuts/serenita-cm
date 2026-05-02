$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $projectRoot "frontend"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path $npmCmd)) {
    throw "No se encontro npm en C:\Program Files\nodejs. Revisa la instalacion de Node.js."
}

$env:Path = "C:\Program Files\nodejs;$env:Path"

Set-Location $frontendDir
& $npmCmd run dev
