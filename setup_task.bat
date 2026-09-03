@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Setting up Windows Task Scheduler for Daily 11:00 AM
echo ========================================================

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
    "$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument '\"%~dp0run_silent.vbs\"'; ^
     $trigger = New-ScheduledTaskTrigger -Daily -At 11:00AM; ^
     $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable; ^
     Register-ScheduledTask -TaskName 'BisaRateTrackerDaily' -Action $action -Trigger $trigger -Settings $settings -Force"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Task "BisaRateTrackerDaily" was created successfully!
    echo It will execute automatically every day at 11:00 AM.
    echo.
) else (
    echo.
    echo [ERROR] Failed to register task. Error code: %ERRORLEVEL%
    echo.
)

pause
