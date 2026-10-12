<#
.SYNOPSIS
    Ashok Raj Hotel App - Smart Mobile Development Starter
.DESCRIPTION
    1. Runs sync-mobile-env.ps1 to automatically detect Windows LAN IPv4 address (Wi-Fi or Hotspot).
    2. Updates frontend/mobile/.env with EXPO_PUBLIC_API_URL and EXPO_PUBLIC_WS_URL.
    3. Checks Fastify backend availability on port 3001.
    4. Automatically adds -c (clear Metro cache) if the LAN IP changed since the last run.
    5. Starts Expo development server with all passed arguments.
#>

[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$AdditionalArgs
)

# Determine paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
if (-not (Test-Path (Join-Path $repoRoot "frontend/mobile"))) {
    $repoRoot = (Get-Location).Path
}

$syncScript = Join-Path $scriptDir "sync-mobile-env.ps1"
$mobileDir = Join-Path $repoRoot "frontend/mobile"
$cacheMarkerPath = Join-Path $mobileDir ".expo_ip_changed"

# Run network & environment sync
if (Test-Path $syncScript) {
    & powershell -ExecutionPolicy Bypass -File $syncScript
} else {
    Write-Warning "Auto-sync script not found at: $syncScript"
}

# Determine if cache clear is needed
$ipChanged = Test-Path $cacheMarkerPath
if ($ipChanged) {
    Remove-Item -Path $cacheMarkerPath -Force -ErrorAction SilentlyContinue
    Write-Host ">>> Network IP changed! Metro cache will be cleared (-c) to ensure the phone loads the new IP.`n" -ForegroundColor Magenta
}

# Construct arguments for Expo
$expoArgs = @("start")

if ($ipChanged) {
    $expoArgs += "-c"
}

if ($AdditionalArgs) {
    foreach ($arg in $AdditionalArgs) {
        if ($arg -eq "-c" -or $arg -eq "--clear") {
            if ($expoArgs -notcontains "-c") {
                $expoArgs += "-c"
            }
        } else {
            $expoArgs += $arg
        }
    }
}

Push-Location $mobileDir
try {
    Write-Host "Launching Expo in frontend/mobile with arguments: $($expoArgs -join ' ')`n" -ForegroundColor Cyan
    & npx expo @expoArgs
} finally {
    Pop-Location
}
