@echo off
SETLOCAL EnableDelayedExpansion

:: ================================================================
:: 🛰️ DUYดูDEE - MASTER SHIP PROTOCOL [V41.3 PREMIUM]
:: ================================================================
set "PROJECT_ID=duydodeesport"
set "LIVE_URL=https://duydodeesport.web.app"
set "VERSION=V41.3-PREMIUM"
set "START_TIME=%TIME%"

title DUYดูDEE SHIP [%VERSION%] - PRODUCTION

:: Ensure the script runs from its own directory
cd /d "%~dp0"

:: 🎨 UI HELPERS (PowerShell Colors)
set "P_INFO=powershell -Command Write-Host ' [INFO] ' -NoNewline -ForegroundColor Gray; Write-Host"
set "P_TASK=powershell -Command Write-Host ' [TASK] ' -NoNewline -ForegroundColor Cyan; Write-Host"
set "P_OK=powershell -Command Write-Host ' [DONE] ' -NoNewline -ForegroundColor Green; Write-Host"
set "P_ERR=powershell -Command Write-Host ' [FAIL] ' -NoNewline -ForegroundColor Red; Write-Host"

cls
echo.
powershell -Command "Write-Host ' 🚀 DUYดูDEE MASTER SHIP PROTOCOL ' -ForegroundColor White -BackgroundColor DarkCyan"
powershell -Command "Write-Host ' ================================================================' -ForegroundColor Cyan"
echo   Project: %PROJECT_ID% ^| Version: %VERSION%
powershell -Command "Write-Host ' ================================================================' -ForegroundColor Cyan"
echo.

:: 1. ENVIRONMENT VALIDATION
%P_TASK% "Step 1/8: Validating System Integrity..." -ForegroundColor Cyan
if not exist "package.json" (%P_ERR% "Critical Error: package.json missing" -ForegroundColor Red & goto :FAILED)
where firebase >nul 2>nul || (%P_ERR% "Critical Error: Firebase CLI missing" -ForegroundColor Red & goto :FAILED)
where npm >nul 2>nul || (%P_ERR% "Critical Error: NPM missing" -ForegroundColor Red & goto :FAILED)

:: Ensure we are on main branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="main" (%P_ERR% "Error: Must be on 'main' branch to ship (Current: %BRANCH%)" -ForegroundColor Red & goto :FAILED)

%P_OK% "Environment Healthy."

:: 2. DEPENDENCY SYNC
%P_TASK% "Step 2/8: Synchronizing Project Dependencies..." -ForegroundColor Cyan
call npm install --no-audit --silent --prefer-offline || goto :FAILED
%P_OK% "Modules Synchronized."

:: 3. CODE QUALITY CHECK
%P_TASK% "Step 3/8: Executing ESLint Quality Scan..." -ForegroundColor Cyan
call npm run lint || (%P_ERR% "Linting Failed. Quality standards not met." -ForegroundColor Red & goto :FAILED)
%P_OK% "Code Quality Verified."

:: 4. SECURITY AUDIT
%P_TASK% "Step 4/8: Performing Security Vulnerability Audit..." -ForegroundColor Cyan
if exist ".skills\security-auditor\scripts\scan_secrets.py" (
    powershell -Command "if (Get-Command python -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
    if %errorlevel% equ 0 (
        python .skills\security-auditor\scripts\scan_secrets.py || (%P_ERR% "Security concerns identified during scan." -ForegroundColor Yellow)
    ) else (
        %P_INFO% "Python environment not detected. Skipping Secret Scan..." -ForegroundColor Yellow
    )
) else (
    %P_INFO% "Security script not found. Proceeding with caution..." -ForegroundColor Yellow
)
%P_OK% "Security Audit Completed."

:: 5. UNIT TESTING
%P_TASK% "Step 5/8: Running Core Logic Unit Tests..." -ForegroundColor Cyan
call npm test || (%P_ERR% "Unit tests failed. Immediate attention required." -ForegroundColor Red & goto :FAILED)
%P_OK% "All Test Suites Passed."

:: 6. CSS COMPILATION
%P_TASK% "Step 6/8: Compiling Cinematic Design Tokens..." -ForegroundColor Cyan
call npm run build:css || (%P_ERR% "CSS Compilation Failed." -ForegroundColor Red & goto :FAILED)
%P_OK% "Styles Compiled Successfully."

:: 7. PRODUCTION BUNDLE
%P_TASK% "Step 7/8: Generating Production Distribution..." -ForegroundColor Cyan
if exist "dist" rmdir /s /q "dist"
call npm run build || (%P_ERR% "Vite Build Failed." -ForegroundColor Red & goto :FAILED)
%P_OK% "Production Bundle Ready."

:: 8. CLOUD SYNCHRONIZATION
%P_TASK% "Step 8/8: Final Cloud Synchronization..." -ForegroundColor Cyan
call firebase use %PROJECT_ID% || goto :FAILED
call firebase deploy --only hosting,firestore --message "Ship %VERSION%" || (%P_ERR% "Deployment synchronization failed." -ForegroundColor Red & goto :FAILED)

:: FINALIZATION
set "END_TIME=%TIME%"
echo.
powershell -Command "Write-Host ' ================================================================' -ForegroundColor Green"
powershell -Command "Write-Host '   ✅ MISSION ACCOMPLISHED: DUYดูDEE IS LIVE' -ForegroundColor White -BackgroundColor DarkGreen"
powershell -Command "Write-Host ' ================================================================' -ForegroundColor Green"
%P_INFO% "URL:      %LIVE_URL%" -ForegroundColor Cyan
%P_INFO% "Started:  %START_TIME%" -ForegroundColor Gray
%P_INFO% "Finished: %END_TIME%" -ForegroundColor Gray
echo.
set /p launch=" > Launch Cinematic Experience Now? (y/n): "
if /i "%launch%"=="y" start %LIVE_URL%
exit /b 0

:FAILED
echo.
powershell -Command "Write-Host ' ================================================================' -ForegroundColor Red"
powershell -Command "Write-Host '   ❌ SHIP PROTOCOL ABORTED. REVIEW LOGS ABOVE.' -ForegroundColor White -BackgroundColor DarkRed"
powershell -Command "Write-Host ' ================================================================' -ForegroundColor Red"
pause
exit /b 1
