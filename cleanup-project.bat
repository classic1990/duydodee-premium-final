@echo off
REM ============================================
REM DUYDODEE PREMIUM - PROJECT CLEANUP SCRIPT
REM ============================================

echo ============================================
echo    DUYDODEE PREMIUM - PROJECT CLEANUP
echo ============================================
echo.

echo [1/4] Checking for unused files...
if exist "public\assets\logo\ban.png" (
    echo   - Found unused file: ban.png
) else (
    echo   - ban.png already removed
)

if exist "CODE_OF_CONDUCT.md" (
    echo   - Found optional file: CODE_OF_CONDUCT.md
) else (
    echo   - CODE_OF_CONDUCT.md already removed
)

echo.
echo [2/4] Removing unused files...
if exist "public\assets\logo\ban.png" (
    del "public\assets\logo\ban.png"
    echo   ✓ Removed: ban.png
)

if exist "CODE_OF_CONDUCT.md" (
    del "CODE_OF_CONDUCT.md"
    echo   ✓ Removed: CODE_OF_CONDUCT.md
)

echo.
echo [3/4] Checking for temporary files...
if exist "backup\" (
    echo   - Found backup directory
    rmdir /s /q "backup\"
    echo   ✓ Removed: backup directory
)

if exist "files\" (
    echo   - Found files directory
    rmdir /s /q "files\"
    echo   ✓ Removed: files directory
)

echo.
echo [4/4] Cleanup complete!
echo.
echo ============================================
echo    PROJECT CLEANUP COMPLETED
echo ============================================
echo.
echo Removed files:
echo   - public\assets\logo\ban.png (unused image)
echo   - CODE_OF_CONDUCT.md (optional documentation)
echo   - backup\ directory (if existed)
echo   - files\ directory (if existed)
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Verify the application works correctly
echo   3. Run: npm run lint
echo   4. Run: npm run test
echo.
pause