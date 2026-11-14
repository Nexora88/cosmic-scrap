@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate-voices.ps1"
if errorlevel 1 (
  echo.
  echo Voice generation did not complete. Read the error above.
) else (
  echo.
  echo All voice assets were generated and pushed to PR #99.
)
pause
