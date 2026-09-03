@echo off
setlocal
echo ========================================================
echo   Removing Scheduled Task: BisaRateTrackerDaily
echo ========================================================

schtasks /delete /tn "BisaRateTrackerDaily" /f

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Scheduled task "BisaRateTrackerDaily" removed.
) else (
    echo [INFO] Task not found or already removed.
)

pause
