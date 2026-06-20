@echo off
title DUYDODEE - Professional Deployment System
color 0B
chcp 65001 >nul

:MAIN_MENU
cls
echo =====================================================================
echo    DUYDODEE EXECUTIVE - DEPLOYMENT SYSTEM
echo =====================================================================
echo    [1] Quick Deploy (Build CSS + Build Prod + Deploy Hosting Only)
echo    [2] Full Deploy (Run Lint + Build CSS + Build Prod + Deploy All)
echo    [3] Build Only (Build CSS + Build Production)
echo    [4] Deploy Security Rules and Indexes Only
echo    [5] Run Local Development Server (npm run dev)
echo    [6] Pre-deployment Checks (Node, Git, Firebase CLI, Install)
echo    [0] Exit
echo =====================================================================
echo.
set /p choice="Select Option (0-6): "

if "%choice%"=="1" goto QUICK_DEPLOY
if "%choice%"=="2" goto FULL_DEPLOY
if "%choice%"=="3" goto BUILD_ONLY
if "%choice%"=="4" goto DEPLOY_RULES
if "%choice%"=="5" goto RUN_DEV
if "%choice%"=="6" goto PRE_CHECKS
if "%choice%"=="0" goto EXIT
goto INVALID_CHOICE

:PRE_CHECKS
cls
echo =====================================================================
echo   Checking system prerequisites...
echo =====================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js not found! Please install Node.js first.
    pause
    goto MAIN_MENU
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  [SUCCESS] Node.js: %NODE_VER%

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm not found!
    pause
    goto MAIN_MENU
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo  [SUCCESS] npm: v%NPM_VER%

where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [WARNING] Firebase CLI not found globally. Will try 'npx firebase'
    set FIREBASE_CMD=npx firebase
) else (
    for /f "tokens=*" %%i in ('firebase --version') do set FB_VER=%%i
    echo  [SUCCESS] Firebase CLI: v%FB_VER%
    set FIREBASE_CMD=firebase
)

if not exist node_modules (
    echo.
    echo  [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed!
        pause
        goto MAIN_MENU
    )
) else (
    echo  [SUCCESS] Dependencies (node_modules) are ready
)
echo.
echo =====================================================================
echo  System is ready for deployment!
echo =====================================================================
echo.
pause
goto MAIN_MENU

:QUICK_DEPLOY
cls
echo =====================================================================
echo   Running Quick Deploy (Vite Build + Firebase Hosting Only)...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

echo  [1/3] Compiling Tailwind CSS...
call npm run build:css
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [2/3] Building production bundle...
call npm run build:prod
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [3/3] Deploying to Firebase Hosting...
call %FIREBASE_CMD% deploy --only hosting
if %errorlevel% neq 0 goto DEPLOY_FAILED

goto DEPLOY_SUCCESS

:FULL_DEPLOY
cls
echo =====================================================================
echo   Running Full Deploy (Test + Lint + Build + Deploy All)...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

echo  [1/5] Running Tests...
call npm run test
if %errorlevel% neq 0 (
    echo  [WARNING] Tests failed. Continuing anyway...
)

echo  [2/5] Running Linter...
call npm run lint
if %errorlevel% neq 0 (
    echo  [WARNING] Lint warnings or errors found.
)

echo  [3/5] Compiling Tailwind CSS...
call npm run build:css
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [4/5] Building production bundle...
call npm run build:prod
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [5/5] Deploying all resources to Firebase...
call %FIREBASE_CMD% deploy
if %errorlevel% neq 0 goto DEPLOY_FAILED

goto DEPLOY_SUCCESS

:BUILD_ONLY
cls
echo =====================================================================
echo   Building project files...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

echo  [1/2] Compiling CSS...
call npm run build:css
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [2/2] Building Vite Production Bundle...
call npm run build:prod
if %errorlevel% neq 0 goto BUILD_FAILED

color 0A
echo.
echo =====================================================================
echo  Build successful! Files are in the /dist folder.
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:DEPLOY_RULES
cls
echo =====================================================================
echo   Deploying Firestore Rules and Indexes...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

call %FIREBASE_CMD% deploy --only firestore:rules,firestore:indexes
if %errorlevel% neq 0 goto DEPLOY_FAILED

color 0A
echo.
echo =====================================================================
echo  Rules and Indexes deployed successfully!
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:RUN_DEV
cls
echo =====================================================================
echo   Starting Local Development Server...
echo =====================================================================
echo.
call npm run dev
goto MAIN_MENU

:RUN_CHECKS_SILENT
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed!
    pause
    goto MAIN_MENU
)
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    set FIREBASE_CMD=npx firebase
) else (
    set FIREBASE_CMD=firebase
)
exit /b

:BUILD_FAILED
color 0C
echo.
echo =====================================================================
echo  [ERROR] Build failed! Please check your code.
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:DEPLOY_FAILED
color 0C
echo.
echo =====================================================================
echo  [ERROR] Deployment failed!
echo  Please verify you are logged in using "firebase login".
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:DEPLOY_SUCCESS
color 0A
echo.
echo =====================================================================
echo  Deployment completed successfully!
echo  Visit: https://duydodeesport.web.app
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:INVALID_CHOICE
color 0C
echo.
echo Invalid option! Please select 0 to 6.
timeout /t 2 >nul
color 0B
goto MAIN_MENU

:EXIT
cls
echo Thank you for using the deployment system. Goodbye!
timeout /t 2 >nul
exit /b
