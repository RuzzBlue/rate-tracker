@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Pushing Banco BISA USDT Updates to GitHub Pages
echo ========================================================

where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH on Windows.
    echo Please install Git for Windows from https://git-scm.com/
    pause
    exit /b 1
)

if not exist ".git" (
    echo Initializing git repository...
    git init
    git branch -M main
)

rem Check if remote origin exists
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTICE] No GitHub remote repository configured yet.
    echo Please run:
    echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo Staging updated rates, dashboard, docs, and screenshots...
git add index.html docs.html styles.css app.js rates.json rates.js README.md screenshots/*

git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo [INFO] No new changes to push. Dashboard is already up to date on GitHub!
    pause
    exit /b 0
)

for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set TODAY=%%d-%%b-%%c
)
git commit -m "Update Banco BISA exchange rates and screenshots: %date% %time%"

echo Pushing to GitHub (main branch)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Successfully pushed to GitHub!
    echo Your GitHub Pages site will update automatically in 1-2 minutes.
    echo.
) else (
    echo.
    echo [ERROR] Git push failed. Please check your GitHub credentials and branch.
    echo.
)

pause
