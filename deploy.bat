@echo off
title DUYDODEE - Professional Deployment System
color 0B
chcp 65001 >nul

:MAIN_MENU
cls
echo =====================================================================
echo    🚀 DUYDODEE EXECUTIVE - DEPLOYMENT SYSTEM
echo =====================================================================
echo    [1] ⚡ Quick Deploy (Build CSS + Build Prod + Deploy Hosting Only)
echo    [2] 🔥 Full Deploy (Run Lint + Build CSS + Build Prod + Deploy All)
echo    [3] 📦 Build Only (Build CSS + Build Production)
echo    [4] 🛡️  Deploy Security Rules & Indexes Only
echo    [5] 💻 Run Local Development Server (npm run dev)
echo    [6] 🔍 Pre-deployment Checks (Node, Git, Firebase CLI, Install)
echo    [0] 🚪 Exit
echo =====================================================================
echo.
set /p choice="กรุณาเลือกรายการที่ต้องการ (0-6): "

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
echo   🔍 ตรวจสอบความต้องการของระบบ (Prerequisite Checks)...
echo =====================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] ไม่พบ Node.js ในระบบของคุณ! กรุณาติดตั้ง Node.js ก่อนดำเนินการต่อ.
    pause
    goto MAIN_MENU
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  [SUCCESS] Node.js: %NODE_VER%

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] ไม่พบ npm ในระบบของคุณ!
    pause
    goto MAIN_MENU
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo  [SUCCESS] npm: v%NPM_VER%

:: Check Firebase CLI
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [WARNING] ไม่พบ Firebase CLI ทั่วไปในระบบ (จะลองใช้ npx firebase แทน)
    set FIREBASE_CMD=npx firebase
) else (
    for /f "tokens=*" %%i in ('firebase --version') do set FB_VER=%%i
    echo  [SUCCESS] Firebase CLI: v%FB_VER%
    set FIREBASE_CMD=firebase
)

:: Check node_modules
if not exist node_modules (
    echo.
    echo  [INFO] ไม่พบโฟลเดอร์ node_modules กำลังติดตั้ง dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] การติดตั้ง dependencies ล้มเหลว!
        pause
        goto MAIN_MENU
    )
) else (
    echo  [SUCCESS] Dependencies (node_modules) พร้อมใช้งาน
)
echo.
echo =====================================================================
echo  ✅ ระบบของคุณพร้อมสำหรับการดิพลอยแล้ว!
echo =====================================================================
echo.
pause
goto MAIN_MENU

:QUICK_DEPLOY
cls
echo =====================================================================
echo   ⚡ กำลังดำเนินการ Quick Deploy (Vite Build + Firebase Hosting Only)...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

echo  [1/3] 🎨 กำลังสร้าง CSS (Tailwind/PostCSS)...
call npm run build:css
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [2/3] 📦 กำลังสร้าง Production Build ด้วย Vite...
call npm run build:prod
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [3/3] 🚀 กำลังดิพลอยไปที่ Firebase Hosting...
call %FIREBASE_CMD% deploy --only hosting
if %errorlevel% neq 0 goto DEPLOY_FAILED

goto DEPLOY_SUCCESS

:FULL_DEPLOY
cls
echo =====================================================================
echo   🔥 กำลังดำเนินการ Full Deploy (Test + Lint + Build + Deploy ทั้งหมด)...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

echo  [1/5] 🧪 กำลังรันการทดสอบ (Unit Tests)...
call npm run test
if %errorlevel% neq 0 (
    echo  [WARNING] การทดสอบพบข้อผิดพลาด แต่จะข้ามไปขั้นตอนถัดไป...
)

echo  [2/5] 🔍 กำลังตรวจสอบโค้ด (ESLint)...
call npm run lint
if %errorlevel% neq 0 (
    echo  [WARNING] ตรวจสอบโค้ดพบข้อผิดพลาด/ข้อแนะนำ
)

echo  [3/5] 🎨 กำลังสร้าง CSS (Tailwind/PostCSS)...
call npm run build:css
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [4/5] 📦 กำลังสร้าง Production Build...
call npm run build:prod
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [5/5] 🚀 กำลังดิพลอยทรัพยากรทั้งหมด (Hosting, Rules, Indexes) ไปยัง Firebase...
call %FIREBASE_CMD% deploy
if %errorlevel% neq 0 goto DEPLOY_FAILED

goto DEPLOY_SUCCESS

:BUILD_ONLY
cls
echo =====================================================================
echo   📦 กำลังสร้าง Build ไฟล์สำหรับตรวจสอบระบบ...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

echo  [1/2] 🎨 กำลังสร้าง CSS...
call npm run build:css
if %errorlevel% neq 0 goto BUILD_FAILED

echo  [2/2] 📦 กำลังสร้าง Vite Production Build...
call npm run build:prod
if %errorlevel% neq 0 goto BUILD_FAILED

color 0A
echo.
echo =====================================================================
echo  ✅ สร้าง Build สำเร็จแล้ว! โค้ดพร้อมในโฟลเดอร์ /dist
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:DEPLOY_RULES
cls
echo =====================================================================
echo   🛡️  กำลังดิพลอย Firestore Security Rules และ Indexes...
echo =====================================================================
echo.
call :RUN_CHECKS_SILENT

call %FIREBASE_CMD% deploy --only firestore:rules,firestore:indexes
if %errorlevel% neq 0 goto DEPLOY_FAILED

color 0A
echo.
echo =====================================================================
echo  ✅ ดิพลอย Rules และ Indexes สำเร็จแล้ว!
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:RUN_DEV
cls
echo =====================================================================
echo   💻 กำลังรัน Development Server...
echo =====================================================================
echo.
call npm run dev
goto MAIN_MENU

:RUN_CHECKS_SILENT
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] ไม่พบ Node.js ในระบบของคุณ!
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
echo  ❌ การบิลด์โครงการ (Build Process) ล้มเหลว! กรุณาตรวจสอบโค้ดของคุณ
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:DEPLOY_FAILED
color 0C
echo.
echo =====================================================================
echo  ❌ การดิพลอย (Deploy) ล้มเหลว!
echo  (กรุณาตรวจสอบว่าได้ล็อกอิน Firebase แล้วด้วยคำสั่ง "firebase login")
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:DEPLOY_SUCCESS
color 0A
echo.
echo =====================================================================
echo  🎉 ดิพลอยโครงการสำเร็จแล้ว!
echo  คุณสามารถเข้าดูเว็บไซต์ได้ที่: https://duydodeesport.web.app
echo =====================================================================
echo.
pause
color 0B
goto MAIN_MENU

:INVALID_CHOICE
color 0C
echo.
echo ตัวเลือกไม่ถูกต้อง! กรุณาเลือก 0 ถึง 6
timeout /t 2 >nul
color 0B
goto MAIN_MENU

:EXIT
cls
echo 👋 ขอบคุณที่ใช้งานระบบดิพลอยอัตโนมัติ ขอให้มีวันที่ดีครับ!
timeout /t 2 >nul
exit /b
