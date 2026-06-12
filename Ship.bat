@echo off
SETLOCAL EnableDelayedExpansion

:: --- CONFIGURATION ---
set "PROJECT_ID=duydodeesport"
set "LIVE_URL=https://duydodeesport.web.app"
set "VERSION=V41.1"

title DUYDOODEE SHIP [%VERSION%] - PRODUCTION DEPLOY

:: Ensure the script runs from its own directory
cd /d "%~dp0"

echo ================================================================
echo    DUYDOODEE - MASTER SHIP PROTOCOL [ %VERSION% ]
echo ================================================================

:: 1. ENVIRONMENT VALIDATION
echo [1/6] Validating System Integrity...
if not exist "package.json" (echo ERROR: package.json missing & goto :FAILED)
where /q firebase || (echo ERROR: Firebase CLI missing & goto :FAILED)
where /q npm || (echo ERROR: NPM missing & goto :FAILED)

:: Optimized Dependency Check
if not exist "node_modules" (
    echo - Installing dependencies...
    call npm install --no-fund --no-audit --silent || goto :FAILED
)

:: 2. CODE QUALITY CHECK
echo [2/6] Linting Code...
call npm run lint || (echo ERROR: Linting failed & goto :FAILED)

:: 3. ASSET PIPELINE
echo [3/6] Building Styles...
call npm run build:css || (echo ERROR: CSS build failed & goto :FAILED)

echo [4/6] Optimizing Assets...
call npm run optimize:images

:: 5. CLOUD SYNCHRONIZATION
echo [5/6] Authenticating & Deploying...
call firebase use %PROJECT_ID% || goto :FAILED
call firebase deploy --only hosting,firestore --message "Ship %VERSION%" || (echo ERROR: Deployment failed & goto :FAILED)

:: 6. FINALIZATION
echo.
echo ================================================================
echo    SUCCESS! DUYDOODEE IS LIVE: %LIVE_URL%
echo ================================================================
echo.
set /p launch="Launch Website Now? (y/n): "
if /i "%launch%"=="y" start %LIVE_URL%
exit /b 0

:FAILED
echo.
echo ================================================================
echo    SHIP PROTOCOL FAILED. REVIEW LOGS ABOVE.
echo ================================================================
pause
exit /b 1
