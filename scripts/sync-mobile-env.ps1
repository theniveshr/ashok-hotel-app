<#
.SYNOPSIS
    Ashok Raj Hotel App - Automatic Mobile IP & Environment Synchronizer
.DESCRIPTION
    Detects the Windows computer's active LAN IPv4 address (Wi-Fi or Mobile Hotspot),
    updates EXPO_PUBLIC_API_URL and EXPO_PUBLIC_WS_URL in frontend/mobile/.env while
    preserving ports, API path prefixes, and other environment variables.
    Checks if the Fastify backend is running on the target port, and signals if Metro cache
    clearing is required due to an IP change.
#>

[CmdletBinding()]
param (
    [switch]$Quiet
)

$ErrorActionPreference = "SilentlyContinue"

# Determine repository root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
if (-not (Test-Path (Join-Path $repoRoot "frontend/mobile"))) {
    $repoRoot = (Get-Location).Path
}

$mobileDir = Join-Path $repoRoot "frontend/mobile"
$envPath = Join-Path $mobileDir ".env"
$envExamplePath = Join-Path $mobileDir ".env.example"
$cacheMarkerPath = Join-Path $mobileDir ".expo_ip_changed"

# Function to detect active LAN IPv4 address
function Get-ActiveLANIP {
    # 1. Preferred: Adapter with active default gateway (active Wi-Fi, Ethernet, or Hotspot)
    try {
        $adapter = Get-NetIPConfiguration -ErrorAction SilentlyContinue | Where-Object { 
            $_.IPv4DefaultGateway -ne $null -and 
            $_.IPv4Address.IPAddress -notmatch '^127\.|^169\.254\.' -and
            $_.InterfaceAlias -notmatch 'vEthernet|VirtualBox|VMware|WSL|Loopback'
        } | Select-Object -First 1

        if ($adapter -and $adapter.IPv4Address.IPAddress) {
            return [PSCustomObject]@{
                IP = $adapter.IPv4Address.IPAddress
                Interface = $adapter.InterfaceAlias
            }
        }
    } catch {}

    # 2. Wi-Fi or Ethernet specific active IPv4
    try {
        $ipObj = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {
            $_.InterfaceAlias -match 'Wi-Fi|WiFi|Ethernet|Local Area Connection' -and
            $_.InterfaceAlias -notmatch 'vEthernet|VirtualBox|VMware|WSL|Loopback' -and
            $_.IPAddress -notmatch '^127\.|^169\.254\.'
        } | Select-Object -First 1

        if ($ipObj -and $ipObj.IPAddress) {
            return [PSCustomObject]@{
                IP = $ipObj.IPAddress
                Interface = $ipObj.InterfaceAlias
            }
        }
    } catch {}

    # 3. Any non-virtual active IPv4
    try {
        $ipObj = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {
            $_.InterfaceAlias -notmatch 'vEthernet|VirtualBox|VMware|WSL|Loopback' -and
            $_.IPAddress -notmatch '^127\.|^169\.254\.'
        } | Select-Object -First 1

        if ($ipObj -and $ipObj.IPAddress) {
            return [PSCustomObject]@{
                IP = $ipObj.IPAddress
                Interface = $ipObj.InterfaceAlias
            }
        }
    } catch {}

    return [PSCustomObject]@{
        IP = "127.0.0.1"
        Interface = "Loopback"
    }
}

$detected = Get-ActiveLANIP
$detectedIp = $detected.IP
$interfaceName = $detected.Interface

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ASHOK RAJ HOTEL APP - AUTO IP & NETWORK SYNC" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Detected Network:  $interfaceName" -ForegroundColor White
Write-Host "  Current IPv4:      $detectedIp" -ForegroundColor Green

# Ensure frontend/mobile/.env exists
if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "  Created frontend/mobile/.env from .env.example" -ForegroundColor Yellow
    } else {
        Set-Content -Path $envPath -Value ""
    }
}

# Read existing .env to preserve existing port and API path
$rawContent = Get-Content -Path $envPath -Raw -ErrorAction SilentlyContinue

$oldIp = ""
$apiPort = "3001"
$apiPath = "/api/v1"
$wsPort = "3001"

if ($rawContent -match 'EXPO_PUBLIC_API_URL=["'']?https?://([^/:]+)(?::(\d+))?(/[^"'']*)?') {
    $oldIp = $matches[1]
    if ($matches[2]) { $apiPort = $matches[2] }
    if ($matches[3]) { $apiPath = $matches[3] }
}

if ($rawContent -match 'EXPO_PUBLIC_WS_URL=["'']?wss?://[^/:]+(?::(\d+))?') {
    if ($matches[1]) { $wsPort = $matches[1] }
} else {
    $wsPort = $apiPort
}

$ipChanged = ($oldIp -ne "" -and $oldIp -ne $detectedIp)

if ($ipChanged) {
    Write-Host "  Network Changed:   $oldIp  ->  $detectedIp" -ForegroundColor Yellow
    Set-Content -Path $cacheMarkerPath -Value $detectedIp -Force
} else {
    Write-Host "  IP Configuration:  Up to date ($detectedIp)" -ForegroundColor DarkGray
    if (Test-Path $cacheMarkerPath) {
        Remove-Item -Path $cacheMarkerPath -Force -ErrorAction SilentlyContinue
    }
}

# Update .env lines preserving comments and all other variables
$lines = Get-Content -Path $envPath
$updatedLines = @()
$hasApiUrl = $false
$hasWsUrl = $false

foreach ($line in $lines) {
    if ($line -match '^\s*EXPO_PUBLIC_API_URL\s*=') {
        $updatedLines += "EXPO_PUBLIC_API_URL=`"http://${detectedIp}:${apiPort}${apiPath}`""
        $hasApiUrl = $true
    } elseif ($line -match '^\s*EXPO_PUBLIC_WS_URL\s*=') {
        $updatedLines += "EXPO_PUBLIC_WS_URL=`"ws://${detectedIp}:${wsPort}`""
        $hasWsUrl = $true
    } else {
        $updatedLines += $line
    }
}

if (-not $hasApiUrl) {
    $updatedLines += "EXPO_PUBLIC_API_URL=`"http://${detectedIp}:${apiPort}${apiPath}`""
}
if (-not $hasWsUrl) {
    $updatedLines += "EXPO_PUBLIC_WS_URL=`"ws://${detectedIp}:${wsPort}`""
}

Set-Content -Path $envPath -Value $updatedLines -Encoding UTF8

Write-Host "  API Base URL:      http://${detectedIp}:${apiPort}${apiPath}" -ForegroundColor Cyan
Write-Host "  WebSocket URL:     ws://${detectedIp}:${wsPort}" -ForegroundColor Cyan

# Backend health verification on target port
$backendOnline = $false
foreach ($checkHost in @("127.0.0.1", $detectedIp)) {
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://${checkHost}:${apiPort}/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($healthCheck.status -eq "ok" -or $healthCheck.status -eq "degraded") {
            $backendOnline = $true
            break
        }
    } catch {}
}

if (-not $backendOnline) {
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://127.0.0.1:${apiPort}${apiPath}/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($healthCheck.status -eq "ok" -or $healthCheck.status -eq "degraded") {
            $backendOnline = $true
        }
    } catch {}
}

if ($backendOnline) {
    Write-Host "  Backend Status:    ACTIVE on port $apiPort (Health: OK)" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  [!] NOTICE: Fastify backend is not responding on port $apiPort." -ForegroundColor Yellow
    Write-Host "      Please ensure you start the backend in another terminal:" -ForegroundColor Yellow
    Write-Host "      👉 npm run api" -ForegroundColor White
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
