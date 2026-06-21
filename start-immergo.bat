@echo off
setlocal EnableExtensions

rem Double-click this file to start Immergo (Hebrew learning app).
rem 1) Free ports 8000/5173 if occupied
rem 2) Open backend + frontend in two windows
rem 3) Open browser

set "ROOT=%~dp0"
set "APP=%ROOT%app"

if not exist "%APP%\package.json" (
  echo ERROR: app folder not found: %APP%
  pause
  exit /b 1
)

if not exist "%APP%\venv\Scripts\python.exe" (
  echo ERROR: Python venv not found. See DEPLOY.md for setup.
  pause
  exit /b 1
)

echo Checking ports 8000 and 5173...
powershell -NoProfile -Command ^
  "foreach ($p in 8000,5173) { $c = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { $procId = $c.OwningProcess; Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue; Write-Host ('Freed port ' + $p + ' (PID ' + $procId + ')') } else { Write-Host ('Port ' + $p + ' is free') } }"

echo.
echo Starting Immergo...
echo   Backend  -> new window (port 8000, token logs: [TOKENS] ...)
echo   Frontend -> new window (port 5173)
echo.

start "Immergo Backend" cmd /k ""%APP%\run-backend.cmd""
start "Immergo Frontend" cmd /k ""%APP%\run-frontend.cmd""

echo Waiting for servers to start...
timeout /t 8 /nobreak >nul

start "" http://localhost:5173/

echo.
echo Browser opened. Close Backend and Frontend windows to stop the app.
timeout /t 3 /nobreak >nul
