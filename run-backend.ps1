$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
$gtkBin = "C:\Program Files\GTK3-Runtime Win64\bin"

if (-not (Test-Path $venvPython)) {
    throw "No se encontro el entorno virtual en backend\.venv. Ejecuta primero la instalacion del backend."
}

if (Test-Path $gtkBin) {
    $env:Path = "$gtkBin;$env:Path"
}

Set-Location $backendDir
& $venvPython -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
