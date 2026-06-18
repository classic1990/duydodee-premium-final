@echo off
chcp 65001 >nul
title DUYDODEE Quick Deploy
color 0B

echo ================================================================
echo  DUYDODEE QUICK DEPLOY (Free Tier Optimized)
echo ================================================================
echo.

REM Quick steps for fast deployment
echo [1/6] Pull latest changes...
call git pull origin main
echo.

echo [2/6] Build CSS...
call npm run build:css
echo.

echo [3/6] Lint code...
call npm run lint:fix
echo.

echo [4/6] Build production...
call npm run build:prod
echo.

echo [5/6] Deploy to Firebase (Hosting + Firestore)...
call firebase deploy
echo.

echo [6/6] Done!
echo.
echo ================================================================
echo  DUYDODEE IS LIVE: https://duydodeesport.web.app
echo  Functions Removed - Free Tier Optimized
echo ================================================================
echo.

echo  Open website? (y/n):
set /p choice=
if /i "%choice%"=="y" (
    start https://duydodeesport.web.app
)

pause
