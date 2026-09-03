@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Banco BISA USDT Exchange Rate Capture
echo ========================================================
echo Running scraper inside isolated WSL2 Ubuntu environment...

wsl.exe -d Ubuntu -- /home/ruzzblue/.virtualenvs/bisa-tracker/bin/python /mnt/c/Users/RuzzBlue/Documents/Dev/bisa-rate-tracker/capture_rates.py

set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% NEQ 0 (
    echo [ERROR] Capture failed with exit code %EXIT_CODE%. Check logs\capture.log for details.
) else (
    echo [SUCCESS] Capture completed successfully!
)

exit /b %EXIT_CODE%
