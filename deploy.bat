@echo off
echo ========================================
echo   DUYDODEE One-Click Deployment
echo ========================================

echo [1/2] [BUILD] Starting production build...
call npm run build:prod
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Deployment aborted.
    pause
    exit /b 1
)
echo [OK] Build successful!

echo.
echo [2/2] [DEPLOY] Deploying to Firebase Hosting...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Deployment completed successfully!
echo ========================================
pause
