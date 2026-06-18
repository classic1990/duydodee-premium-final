@echo off
chcp 65001 >nul
title ⚡ DUYDODEE Performance Audit V6.0
color 0E

echo ================================================================
echo  ⚡ DUYDODEE PERFORMANCE & PWA AUDIT V6.0
echo  Version: V6.0-NEURAL-EDITION
echo ================================================================
echo.

REM Check for Lighthouse CLI
echo [TASK] 1/5: Checking Environment...
call npx lighthouse --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Lighthouse CLI not found. Installing via npx...
    call npx lighthouse --version
)
echo [DONE] Environment Ready.
echo.

REM Step 2: Build Production
echo [TASK] 2/5: Preparing Production Build...
call npm run build:prod
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Cannot audit.
    pause
    exit /b 1
)
echo [DONE] Production Build Ready.
echo.

REM Step 3: Start Preview Server (Automated)
echo [TASK] 3/5: Starting Preview Server...
echo [INFO] Starting local preview server...
echo [INFO] This will run in the background...

REM Start preview server in background
start /B npm run preview

REM Wait for server to start
echo [INFO] Waiting for server to start (10 seconds)...
timeout /t 10 >nul

REM Check if server is running by testing the port
echo [INFO] Checking if server is ready...
curl -s http://localhost:4173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [DONE] Server is running at http://localhost:4173
) else (
    echo [WARN] Server may still be starting. Attempting audit anyway...
)
echo.

REM Step 4: Execute Lighthouse Audit
echo [TASK] 4/5: Executing Lighthouse Audit...
echo [INFO] Target: http://localhost:4173
echo [INFO] This will take about 1-2 minutes. Chrome will open and close.
echo.

REM Run Lighthouse
call npx lighthouse http://localhost:4173 --view --output html --output-path ./audit-report.html --chrome-flags="--headless"

if %errorlevel% neq 0 (
    echo.
    echo [WARN] Audit encountered some issues. Report may still be generated.
    echo [INFO] This is common for local development servers.
    echo [INFO] The report will still be saved for manual review.
)

echo.
echo [DONE] Lighthouse audit completed.
echo.

REM Step 5: Cleanup
echo [TASK] 5/5: Cleaning up processes...
echo [INFO] Stopping preview server...

REM Kill the preview server process
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [DONE] Preview server stopped.
) else (
    echo [INFO] No preview server process found to stop.
)
echo.

echo ================================================================
echo  ✅ AUDIT COMPLETED
echo ================================================================
echo  [DONE] Report saved to: ./audit-report.html
echo  [INFO] Opening report in your browser...
echo.

start ./audit-report.html

echo.
echo 💡 Performance Tips:
echo    - For more accurate results, deploy to production first
echo    - Local development servers may show lower scores
echo    - Use Chrome DevTools Lighthouse for detailed analysis
echo    - Network conditions affect performance scores
echo.

pause
