# PowerShell Deployment Script for DUYDODEE
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Show-Header {
    Clear-Host
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "    🚀 DUYDODEE EXECUTIVE - DEPLOYMENT SYSTEM (PowerShell)" -ForegroundColor White -Bold
    Write-Host "=====================================================================" -ForegroundColor Cyan
}

function Run-PrereqChecks {
    Write-Host "`n🔍 Checking system prerequisites..." -ForegroundColor Cyan
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVer = (node -v).Trim()
        Write-Host "  ✅ Node.js: $nodeVer" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Node.js is not installed!" -ForegroundColor Red
        return $false
    }
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $npmVer = (npm -v).Trim()
        Write-Host "  ✅ npm: v$npmVer" -ForegroundColor Green
    } else {
        Write-Host "  ❌ npm is not installed!" -ForegroundColor Red
        return $false
    }
    global: $fbCmd = "firebase"
    if (Get-Command firebase -ErrorAction SilentlyContinue) {
        $fbVer = (firebase --version).Trim()
        Write-Host "  ✅ Firebase CLI: v$fbVer" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Firebase CLI not found globally. Will try 'npx firebase'" -ForegroundColor Yellow
        global: $fbCmd = "npx firebase"
    }
    if (-not (Test-Path "node_modules")) {
        Write-Host "  ⚠️  node_modules folder not found. Installing..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) { return $false }
    }
    return $true
}

function Show-Menu {
    Show-Header
    Write-Host "   [1] ⚡ Quick Deploy (Build Production + Deploy Hosting)"
    Write-Host "   [2] 🔥 Full Deploy (Lint + Build Production + Deploy All)"
    Write-Host "   [3] 📦 Build Only (Build Vite Production)"
    Write-Host "   [4] 🛡️  Deploy Security Rules and Indexes Only"
    Write-Host "   [5] 💻 Run Local Development Server (npm run dev)"
    Write-Host "   [6] 🔍 Pre-deployment Checks"
    Write-Host "   [0] 🚪 Exit"
    Write-Host "=====================================================================" -ForegroundColor Cyan
}

do {
    Show-Menu
    $choice = Read-Host "`nกรุณาเลือกรายการที่ต้องการ (0-6)"
    switch ($choice) {
        "1" {
            Show-Header
            if (Run-PrereqChecks) {
                npm run build
                if ($LASTEXITCODE -eq 0) {
                    Invoke-Expression "$fbCmd deploy --only hosting"
                }
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        "2" {
            Show-Header
            if (Run-PrereqChecks) {
                npm run lint
                npm run test
                npm run build
                if ($LASTEXITCODE -eq 0) {
                    Invoke-Expression "$fbCmd deploy"
                }
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        "3" {
            Show-Header
            if (Run-PrereqChecks) {
                npm run build
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        "4" {
            Show-Header
            if (Run-PrereqChecks) {
                Invoke-Expression "$fbCmd deploy --only firestore:rules,firestore:indexes"
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        "5" {
            Show-Header
            npm run dev
        }
        "6" {
            Show-Header
            $res = Run-PrereqChecks
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        "0" {
            Write-Host "`n👋 ขอบคุณที่ใช้งานระบบดิพลอยอัตโนมัติ!" -ForegroundColor Cyan
            Start-Sleep -Seconds 2
            return
        }
        default {
            Write-Host "`n❌ ตัวเลือกไม่ถูกต้อง!" -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
} while ($true)
