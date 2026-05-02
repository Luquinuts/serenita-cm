@echo off
setlocal

set "ROOT=%~dp0"

start "Serenita Backend" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%ROOT%run-backend.ps1"
timeout /t 2 /nobreak >nul
start "Serenita Frontend" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%ROOT%run-frontend.ps1"

echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
