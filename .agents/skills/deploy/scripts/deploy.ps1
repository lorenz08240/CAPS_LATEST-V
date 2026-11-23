<#
.SYNOPSIS
    Automated Production Deploy Script for BuildLab Stack.
    Pre-compiles production assets and starts:
      1. Database (MySQL via XAMPP on Port 3306)
      2. Backend (Node Express on Port 5000 - also serves production SPA)
      3. Frontend (Vite Production Preview on Port 5173 - lag-free presentation mode)
      4. Cloudflare Tunnel (cloudflared -> Port 5173)
#>

param(
    [switch]$SkipBuild = $false,
    [switch]$ForceRestart = $false
)

$ErrorActionPreference = "Continue"

$rootDir = Resolve-Path "$PSScriptRoot\..\..\.."
if (-not (Test-Path "$rootDir\backend")) {
    $rootDir = (Get-Location).Path
}

$logsDir = Join-Path $rootDir "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$status = [ordered]@{
    Database   = "UNKNOWN"
    Backend    = "UNKNOWN"
    Frontend   = "UNKNOWN"
    Tunnel     = "UNKNOWN"
    TunnelUrl  = $null
    QrCodeUrl  = $null
}

function Start-Detached([string]$cmd, [string]$dir) {
    $procClass = [wmiclass]"Win32_Process"
    $startupInfo = [wmiclass]"Win32_ProcessStartup"
    $startup = $startupInfo.CreateInstance()
    $startup.ShowWindow = 0 # SW_HIDE
    $res = $procClass.Create($cmd, $dir, $startup)
    return $res.ProcessId
}

function Test-PortOpen([int]$port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $port, $null, $null)
        if ($iar.AsyncWaitHandle.WaitOne(600, $false) -and $client.Connected) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch {
        return $false
    }
}

function Get-PortProcess([int]$port) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            $pidToFind = ($conns | Select-Object -First 1).OwningProcess
            return Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -eq $pidToFind }
        }
    } catch {}
    return $null
}

# ----------------------------------------------------
# 1. Database (MySQL - Port 3306)
# ----------------------------------------------------
Write-Host "[1/4] Checking Database (MySQL Port 3306)..." -ForegroundColor Cyan
if (Test-PortOpen 3306) {
    Write-Host "  [OK] MySQL is active and listening." -ForegroundColor Green
    $status.Database = "RUNNING (Port 3306)"
} else {
    Write-Host "  [...] Starting MySQL (XAMPP)..." -ForegroundColor Yellow
    $mysqldExe = "C:\xampp\mysql\bin\mysqld.exe"
    $myIni = "C:\xampp\mysql\bin\my.ini"
    
    if (Test-Path $mysqldExe) {
        Start-Detached "cmd.exe /c $mysqldExe --defaults-file=$myIni --standalone" "C:\xampp" | Out-Null
    } elseif (Test-Path "C:\xampp\mysql_start.bat") {
        Start-Detached "cmd.exe /c C:\xampp\mysql_start.bat" "C:\xampp" | Out-Null
    } else {
        Write-Host "  [!] Warning: MySQL executable not located at C:\xampp\mysql\bin\mysqld.exe" -ForegroundColor Red
    }

    $waited = 0
    while (-not (Test-PortOpen 3306) -and $waited -lt 20) {
        Start-Sleep -Seconds 1
        $waited++
    }

    if (Test-PortOpen 3306) {
        Write-Host "  [OK] MySQL started successfully." -ForegroundColor Green
        $status.Database = "RUNNING (Port 3306)"
    } else {
        Write-Host "  [FAIL] MySQL failed to open port 3306 within 20s." -ForegroundColor Red
        $status.Database = "FAILED"
    }
}

# ----------------------------------------------------
# 2. Backend (Node.js Express - Port 5000)
# ----------------------------------------------------
Write-Host "[2/4] Checking Backend (Port 5000)..." -ForegroundColor Cyan
if (Test-PortOpen 5000 -and -not $ForceRestart) {
    Write-Host "  [OK] Backend is active and listening." -ForegroundColor Green
    $status.Backend = "RUNNING (Port 5000)"
} else {
    if ($ForceRestart) {
        $p = Get-PortProcess 5000
        if ($p) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }
    }
    Write-Host "  [...] Starting Backend server..." -ForegroundColor Yellow
    $backendDir = Join-Path $rootDir "backend"
    $backendLog = Join-Path $logsDir "backend.log"
    $cmd = "cmd.exe /c node server.js > `"$backendLog`" 2>&1"
    
    Start-Detached $cmd $backendDir | Out-Null

    $waited = 0
    while (-not (Test-PortOpen 5000) -and $waited -lt 8) {
        Start-Sleep -Seconds 1
        $waited++
    }

    if (Test-PortOpen 5000) {
        Write-Host "  [OK] Backend started successfully." -ForegroundColor Green
        $status.Backend = "RUNNING (Port 5000)"
    } else {
        Write-Host "  [FAIL] Backend failed to open port 5000." -ForegroundColor Red
        $status.Backend = "FAILED"
    }
}

# ----------------------------------------------------
# 3. Frontend (Production Build & Preview - Port 5173)
# ----------------------------------------------------
Write-Host "[3/4] Checking Frontend (Production Mode - Port 5173)..." -ForegroundColor Cyan
$frontendDir = Join-Path $rootDir "frontend"
$distDir = Join-Path $frontendDir "dist"

# Check if current process on 5173 is dev mode or preview mode
$currentFrontendProc = Get-PortProcess 5173
$isDevServer = $false
if ($currentFrontendProc) {
    if ($currentFrontendProc.CommandLine -match "vite" -and $currentFrontendProc.CommandLine -notmatch "preview") {
        $isDevServer = $true
        Write-Host "  [!] Detected frontend running in Dev Mode (causes mobile lag/blank screen). Switching to Production Preview..." -ForegroundColor Yellow
    }
}

# Build if dist doesn't exist, not skipped, or replacing dev mode
if ((-not (Test-Path $distDir)) -or (-not $SkipBuild) -or $isDevServer -or $ForceRestart) {
    Write-Host "  [...] Compiling production assets (npm run build)..." -ForegroundColor Yellow
    $buildProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run build" -WorkingDirectory $frontendDir -Wait -PassThru -WindowStyle Hidden
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "  [OK] Production build ready (zero lag, minified chunks)." -ForegroundColor Green
    } else {
        Write-Host "  [!] Build warning/notice, continuing with existing bundle." -ForegroundColor Yellow
    }
}

# If it's a dev server or forced restart, stop it so preview can bind to 5173
if ($isDevServer -or $ForceRestart) {
    if ($currentFrontendProc) {
        Stop-Process -Id $currentFrontendProc.ProcessId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

if (Test-PortOpen 5173) {
    Write-Host "  [OK] Frontend is active and listening on port 5173." -ForegroundColor Green
    $status.Frontend = "RUNNING (Port 5173 - Production Preview)"
} else {
    Write-Host "  [...] Starting Frontend in Production Preview mode..." -ForegroundColor Yellow
    $frontendLog = Join-Path $logsDir "frontend.log"
    $cmd = "cmd.exe /c npm run preview > `"$frontendLog`" 2>&1"

    Start-Detached $cmd $frontendDir | Out-Null

    $waited = 0
    while (-not (Test-PortOpen 5173) -and $waited -lt 10) {
        Start-Sleep -Seconds 1
        $waited++
    }

    if (Test-PortOpen 5173) {
        Write-Host "  [OK] Frontend production preview started successfully." -ForegroundColor Green
        $status.Frontend = "RUNNING (Port 5173 - Production Preview)"
    } else {
        Write-Host "  [FAIL] Frontend failed to open port 5173." -ForegroundColor Red
        $status.Frontend = "FAILED"
    }
}

# ----------------------------------------------------
# 4. Live Public Tunnel (Permanent Static Domain)
# ----------------------------------------------------
Write-Host "[4/4] Checking Live Public Tunnel (Permanent Domain)..." -ForegroundColor Cyan
$permanentDomain = "disposal-cylinder-flounder.ngrok-free.dev"
$ngrokBin = "C:\Users\jayma\.gemini\tools\ngrok.exe"
if (-not (Test-Path $ngrokBin)) {
    $ngrokBin = Join-Path $rootDir ".bin\ngrok.exe"
}

$ngrokLog = Join-Path $logsDir "ngrok.log"
$ngrokProcs = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
$foundUrl = $null

if ($ngrokProcs -and -not $ForceRestart) {
    $testCode = curl.exe -s -o NUL -w "%{http_code}" --max-time 5 "https://$permanentDomain"
    if ($testCode -eq "200") {
        $foundUrl = "https://$permanentDomain"
        Write-Host "  [OK] Permanent live tunnel is active and healthy: $foundUrl" -ForegroundColor Green
    } else {
        Write-Host "  [!] Existing tunnel responded with $testCode. Relaunching..." -ForegroundColor Yellow
    }
}

if (-not $foundUrl) {
    if ($ngrokProcs) {
        $ngrokProcs | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 600
    }

    Write-Host "  [...] Launching permanent tunnel on https://$permanentDomain..." -ForegroundColor Yellow
    $ngrokCmd = "`"$ngrokBin`" http 5173 --url=https://$permanentDomain --log=`"$ngrokLog`""
    Start-Detached $ngrokCmd $rootDir | Out-Null

    $waited = 0
    while ($waited -lt 15) {
        Start-Sleep -Seconds 1
        $waited++
        $testCode = curl.exe -s -o NUL -w "%{http_code}" --max-time 3 "https://$permanentDomain"
        if ($testCode -eq "200") {
            $foundUrl = "https://$permanentDomain"
            break
        }
    }
    if ($foundUrl) {
        $status.Tunnel = "ONLINE (Permanent Domain)"
    }
}

# Fallback to Cloudflare Tunnel if Ngrok is unavailable or bandwidth quota is reached (ERR_NGROK_725)
if (-not $foundUrl) {
    Write-Host "  [!] Ngrok permanent domain unavailable or monthly quota reached. Falling back to Cloudflare Tunnel..." -ForegroundColor Yellow
    $cfLog = Join-Path $logsDir "cloudflared.log"
    $cfProcs = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    
    if ($cfProcs -and (Test-Path $cfLog)) {
        $existingLog = Get-Content $cfLog -Raw -ErrorAction SilentlyContinue
        if ($existingLog -match "(https://[a-zA-Z0-9-]+\.trycloudflare\.com)") {
            $candidateUrl = $matches[1]
            $code = curl.exe -s -o NUL -w "%{http_code}" --max-time 4 $candidateUrl
            if ($code -eq "200") {
                $foundUrl = $candidateUrl
                Write-Host "  [OK] Existing Cloudflare Tunnel is active and healthy: $foundUrl" -ForegroundColor Green
            }
        }
    }

    if (-not $foundUrl) {
        if ($cfProcs) {
            $cfProcs | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 600
        }
        if (Test-Path $cfLog) { Remove-Item $cfLog -Force -ErrorAction SilentlyContinue }

        Write-Host "  [...] Starting Cloudflare Tunnel (unlimited bandwidth)..." -ForegroundColor Yellow
        Start-Detached "cmd.exe /c cloudflared tunnel --url http://localhost:5173 > `"$cfLog`" 2>&1" $rootDir | Out-Null

        $waited = 0
        while ($waited -lt 15) {
            Start-Sleep -Seconds 1
            $waited++
            if (Test-Path $cfLog) {
                $logContent = Get-Content $cfLog -Raw -ErrorAction SilentlyContinue
                if ($logContent -match "(https://[a-zA-Z0-9-]+\.trycloudflare\.com)") {
                    $foundUrl = $matches[1]
                    break
                }
            }
        }
    }

    if ($foundUrl) {
        $status.Tunnel = "ONLINE (Cloudflare Fallback)"
    }
}

if ($foundUrl) {
    Write-Host "  [OK] Live Public Tunnel established: $foundUrl" -ForegroundColor Green
    $status.TunnelUrl = $foundUrl
    $status.QrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=$foundUrl"
} else {
    Write-Host "  [FAIL] Failed to establish tunnel (both Ngrok and Cloudflare failed)" -ForegroundColor Red
    $status.Tunnel = "FAILED"
}

Write-Host "`n================ DEPLOY SUMMARY ================" -ForegroundColor Magenta
Write-Host "Database:   $($status.Database)"
Write-Host "Backend:    $($status.Backend)"
Write-Host "Frontend:   $($status.Frontend)"
Write-Host "Live Tunnel: $($status.Tunnel)"
if ($status.TunnelUrl) {
    Write-Host "Tunnel URL: $($status.TunnelUrl)" -ForegroundColor Green
    Write-Host "QR Code:    $($status.QrCodeUrl)"
}
Write-Host "================================================" -ForegroundColor Magenta

# Output JSON
$status | ConvertTo-Json
