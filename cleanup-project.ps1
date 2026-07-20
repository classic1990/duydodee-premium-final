# ============================================
# DUYDODEE PREMIUM - PROJECT CLEANUP SCRIPT
# PowerShell Version
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   DUYDODEE PREMIUM - PROJECT CLEANUP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to remove file if exists
function Remove-FileIfExists {
    param([string]$FilePath, [string]$Description)
    
    if (Test-Path $FilePath) {
        Remove-Item $FilePath -Force
        Write-Host "  ✓ Removed: $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  - Already removed: $Description" -ForegroundColor Gray
        return $false
    }
}

# Function to remove directory if exists
function Remove-DirectoryIfExists {
    param([string]$DirPath, [string]$Description)
    
    if (Test-Path $DirPath) {
        Remove-Item $DirPath -Recurse -Force
        Write-Host "  ✓ Removed: $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  - Already removed: $Description" -ForegroundColor Gray
        return $false
    }
}

Write-Host "[1/5] Analyzing project structure..." -ForegroundColor Yellow
Write-Host ""

# Count files before cleanup
$beforeFiles = (Get-ChildItem -Path . -Recurse -File | Measure-Object).Count
Write-Host "  Current file count: $beforeFiles" -ForegroundColor Cyan
Write-Host ""

Write-Host "[2/5] Removing unused assets..." -ForegroundColor Yellow
Remove-FileIfExists "public\assets\logo\ban.png" "Unused image (ban.png)"
Write-Host ""

Write-Host "[3/5] Removing optional documentation..." -ForegroundColor Yellow
Remove-FileIfExists "CODE_OF_CONDUCT.md" "Optional documentation (CODE_OF_CONDUCT.md)"
Write-Host ""

Write-Host "[4/5] Removing temporary directories..." -ForegroundColor Yellow
Remove-DirectoryIfExists "backup" "Backup directory"
Remove-DirectoryIfExists "files" "Files directory"
Remove-DirectoryIfExists "dist" "Build output directory"
Remove-DirectoryIfExists ".firebase" "Firebase cache directory"
Write-Host ""

Write-Host "[5/5] Final cleanup..." -ForegroundColor Yellow

# Remove any .log files
Get-ChildItem -Path . -Filter "*.log" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-Host "  ✓ Removed: $($_.Name)" -ForegroundColor Green
}

# Count files after cleanup
$afterFiles = (Get-ChildItem -Path . -Recurse -File | Measure-Object).Count
$removedFiles = $beforeFiles - $afterFiles

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PROJECT CLEANUP COMPLETED" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files before: $beforeFiles" -ForegroundColor White
Write-Host "  Files after: $afterFiles" -ForegroundColor White
Write-Host "  Files removed: $removedFiles" -ForegroundColor Green
Write-Host ""
Write-Host "Removed items:" -ForegroundColor Cyan
Write-Host "  ✓ Unused image files" -ForegroundColor Green
Write-Host "  ✓ Optional documentation" -ForegroundColor Green
Write-Host "  ✓ Temporary directories" -ForegroundColor Green
Write-Host "  ✓ Log files" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Verify the application works correctly" -ForegroundColor White
Write-Host "  3. Run: npm run lint" -ForegroundColor White
Write-Host "  4. Run: npm run test" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")