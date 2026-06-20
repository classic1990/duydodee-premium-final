# PowerShell Deployment Script for DUYDODEE
# Set UTF-8 encoding
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Show-Header {
    Clear-Host
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "   🚀 DUYDODEE EXECUTIVE - DEPLOYMENT SYSTEM (PowerShell)" -ForegroundColor White -Bold
    Write-Host "=====================================================================" -ForegroundColor Cyan
}

function Run-PrereqChecks {
    Write-Host "`n🔍 Checking system prerequisites..." -ForegroundColor Cyan
    
    # Check Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVer = (node -v).Trim()
        Write-Host "  ✅ Node.js: $nodeVer" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Node.js is not installed! Please install Node.js from https://nodejs.org" -ForegroundColor Red
        return $false
    }
    
    # Check npm
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $npmVer = (npm -v).Trim()
        Write-Host "  ✅ npm: v$npmVer" -ForegroundColor Green
    } else {
        Write-Host "  ❌ npm is not installed!" -ForegroundColor Red
        return $false
    }
    
    # Check Firebase CLI
    global: $fbCmd = "firebase"
    if (Get-Command firebase -ErrorAction SilentlyContinue) {
        $fbVer = (firebase --version).Trim()
        Write-Host "  ✅ Firebase CLI: v$fbVer" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Firebase CLI not found globally. Will try 'npx firebase'" -ForegroundColor Yellow
        global: $fbCmd = "npx firebase"
    }
    
    # Check node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Host "  ⚠️  node_modules folder not found. Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ npm install failed!" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  ✅ Dependencies (node_modules) are ready" -ForegroundColor Green
    }
    
    return $true
}

function Show-Menu {
    Show-Header
    Write-Host "   [1] " -NoNewline -ForegroundColor Yellow
    Write-Host "⚡ Quick Deploy (Build CSS + Build Prod + Deploy Hosting)"
    Write-Host "   [2] " -NoNewline -ForegroundColor Yellow
    Write-Host "🔥 Full Deploy (Lint + Build CSS + Build Prod + Deploy All)"
    Write-Host "   [3] " -NoNewline -ForegroundColor Yellow
    Write-Host "📦 Build Only (Build CSS + Build Production)"
    Write-Host "   [4] " -NoNewline -ForegroundColor Yellow
    Write-Host "🛡️  Deploy Security Rules & Indexes Only"
    Write-Host "   [5] " -NoNewline -ForegroundColor Yellow
    Write-Host "💻 Run Local Development Server (npm run dev)"
    Write-Host "   [6] " -NoNewline -ForegroundColor Yellow
    Write-Host "🔍 Pre-deployment Checks"
    Write-Host "   [0] " -NoNewline -ForegroundColor Yellow
    Write-Host "🚪 Exit"
    Write-Host "=====================================================================" -ForegroundColor Cyan
}

do {
    Show-Menu
    $choice = Read-Host "`nกรุณาเลือกรายการที่ต้องการ (0-6)"
    
    switch ($choice) {
        "1" {
            Show-Header
            Write-Host "`n⚡ Starting Quick Deploy..." -ForegroundColor Cyan
            if (Run-PrereqChecks) {
                Write-Host "`n[1/3] Compiling Tailwind CSS..." -ForegroundColor Yellow
                npm run build:css
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "`n[2/3] Building production package..." -ForegroundColor Yellow
                    npm run build:prod
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "`n[3/3] Deploying to Firebase Hosting..." -ForegroundColor Yellow
                        Invoke-Expression "$fbCmd deploy --only hosting"
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "`n🎉 Quick Deploy Completed Successfully!" -ForegroundColor Green
                        } else {
                            Write-Host "`n❌ Firebase Deployment Failed!" -ForegroundColor Red
                        }
                    } else {
                        Write-Host "`n❌ Production Build Failed!" -ForegroundColor Red
                    }
                } else {
                    Write-Host "`n❌ CSS Compilation Failed!" -ForegroundColor Red
                }
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        
        "2" {
            Show-Header
            Write-Host "`n🔥 Starting Full Deploy..." -ForegroundColor Cyan
            if (Run-PrereqChecks) {
                Write-Host "`n[1/5] Running ESLint..." -ForegroundColor Yellow
                npm run lint
                
                Write-Host "`n[2/5] Running Tests..." -ForegroundColor Yellow
                npm run test
                
                Write-Host "`n[3/5] Compiling Tailwind CSS..." -ForegroundColor Yellow
                npm run build:css
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "`n[4/5] Building production package..." -ForegroundColor Yellow
                    npm run build:prod
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "`n[5/5] Deploying all resources to Firebase..." -ForegroundColor Yellow
                        Invoke-Expression "$fbCmd deploy"
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "`n🎉 Full Deploy Completed Successfully!" -ForegroundColor Green
                            Write-Host "Live URL: https://duydodeesport.web.app" -ForegroundColor Green
                        } else {
                            Write-Host "`n❌ Firebase Deployment Failed!" -ForegroundColor Red
                        }
                    } else {
                        Write-Host "`n❌ Production Build Failed!" -ForegroundColor Red
                    }
                } else {
                    Write-Host "`n❌ CSS Compilation Failed!" -ForegroundColor Red
                }
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        
        "3" {
            Show-Header
            Write-Host "`n📦 Starting Build Only..." -ForegroundColor Cyan
            if (Run-PrereqChecks) {
                Write-Host "`n[1/2] Compiling Tailwind CSS..." -ForegroundColor Yellow
                npm run build:css
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "`n[2/2] Building production package..." -ForegroundColor Yellow
                    npm run build:prod
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "`n✅ Build Successful! Output generated in /dist" -ForegroundColor Green
                    } else {
                        Write-Host "`n❌ Production Build Failed!" -ForegroundColor Red
                    }
                } else {
                    Write-Host "`n❌ CSS Compilation Failed!" -ForegroundColor Red
                }
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        
        "4" {
            Show-Header
            Write-Host "`n🛡️  Deploying Firestore Rules & Indexes..." -ForegroundColor Cyan
            if (Run-PrereqChecks) {
                Invoke-Expression "$fbCmd deploy --only firestore:rules,firestore:indexes"
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "`n✅ Rules and Indexes Deployed Successfully!" -ForegroundColor Green
                } else {
                    Write-Host "`n❌ Firebase Rules Deployment Failed!" -ForegroundColor Red
                }
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        
        "5" {
            Show-Header
            Write-Host "`n💻 Launching local development server..." -ForegroundColor Cyan
            npm run dev
        }
        
        "6" {
            Show-Header
            $success = Run-PrereqChecks
            if ($success) {
                Write-Host "`n✅ All prerequisites are satisfied. Ready to deploy!" -ForegroundColor Green
            } else {
                Write-Host "`n❌ System check failed! Please fix the errors above." -ForegroundColor Red
            }
            Read-Host "`nกด Enter เพื่อกลับเมนูหลัก..."
        }
        
        "0" {
            Write-Host "`n👋 ขอบคุณที่ใช้งานระบบดิพลอยอัตโนมัติ ขอให้มีวันที่ดีครับ!" -ForegroundColor Cyan
            Start-Sleep -Seconds 2
            break
        }
        
        default {
            Write-Host "`n❌ ตัวเลือกไม่ถูกต้อง! กรุณาเลือก 0 ถึง 6" -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
