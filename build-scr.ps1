param(
    [string]$Version = ""
)

if (-not $Version) {
    $Version = (Get-Content package.json | ConvertFrom-Json).version
}

$ErrorActionPreference = "Stop"

$exe = "src-tauri\target\release\clawdclock.exe"
$bundleDir = "src-tauri\target\release\bundle"
$scr = "$bundleDir\ClawdClock_${Version}_x64.scr"

if (-not (Test-Path $exe)) {
    Write-Error "Build first: npx tauri build"
    exit 1
}

New-Item -ItemType Directory -Force $bundleDir | Out-Null
Copy-Item $exe $scr -Force

$size = (Get-Item $scr).Length
Write-Host "SCR: $scr ($([math]::Round($size/1MB, 1)) MB)" -ForegroundColor Green
