param(
    [Parameter(Mandatory)][string]$Version,
    [string]$Notes = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# ── helpers ──────────────────────────────────────────────────────
function Die($msg) { Write-Error $msg; exit 1 }
function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

# ── validate version ─────────────────────────────────────────────
if ($Version -notmatch '^\d+\.\d+\.\d+$') { Die "Version must be X.Y.Z (no 'v' prefix)" }
$tag = "v$Version"

Step "Bumping version to $Version"

# package.json
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$pkg.version = $Version
$pkg | ConvertTo-Json -Depth 10 | ForEach-Object { $_.TrimEnd() } |
    Set-Content package.json -Encoding UTF8

# tauri.conf.json
$conf = Get-Content src-tauri/tauri.conf.json -Raw | ConvertFrom-Json
$conf.version = $Version
$conf | ConvertTo-Json -Depth 10 | ForEach-Object { $_.TrimEnd() } |
    Set-Content src-tauri/tauri.conf.json -Encoding UTF8

# Cargo.toml — sed-style replace
(Get-Content src-tauri/Cargo.toml -Raw) -replace '^version = "[\d.]+"', "version = `"$Version`"" |
    Set-Content src-tauri/Cargo.toml -Encoding UTF8

Step "Committing + tagging $tag"
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git diff --cached --quiet && Die "Nothing staged — version already at $Version?"
git commit -m "release: $tag"
git tag $tag
git push origin main
git push origin $tag

Step "Building (release + sign)"
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content "$HOME\.tauri\terax-signing.key" -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
npm run tauri build
if ($LASTEXITCODE -ne 0) { Die "tauri build failed" }

Step "Packaging .scr"
npm run build:scr
if ($LASTEXITCODE -ne 0) { Die "build:scr failed" }

Step "Generating latest.json"
$bundleDir = "src-tauri\target\release\bundle"
$nsisSig = Get-Content "$bundleDir\nsis\ClawdClock_${Version}_x64-setup.exe.sig" -Raw
$now = [System.DateTime]::UtcNow.ToString(
    "yyyy-MM-ddTHH:mm:ssZ",
    [System.Globalization.CultureInfo]::InvariantCulture
)
$latestJson = @{
    version  = $Version
    notes    = if ($Notes) { $Notes } else { "See https://github.com/Piya-Boy/ClawdClock/releases/tag/$tag" }
    pub_date = $now
    platforms = @{
        "windows-x86_64" = @{
            signature = $nsisSig.Trim()
            url = "https://github.com/Piya-Boy/ClawdClock/releases/download/$tag/ClawdClock_${Version}_x64-setup.exe"
        }
    }
} | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText(
    (Join-Path $PSScriptRoot "latest.json"),
    $latestJson,
    (New-Object System.Text.UTF8Encoding $false)
)

Step "Creating GitHub release $tag"
$releaseNotes = if ($Notes) { $Notes } else { "Release $tag" }
gh release create $tag `
    --title $tag `
    --notes $releaseNotes `
    "$bundleDir\nsis\ClawdClock_${Version}_x64-setup.exe" `
    "$bundleDir\nsis\ClawdClock_${Version}_x64-setup.exe.sig" `
    "$bundleDir\msi\ClawdClock_${Version}_x64_en-US.msi" `
    "$bundleDir\msi\ClawdClock_${Version}_x64_en-US.msi.sig" `
    "$bundleDir\ClawdClock_${Version}_x64.scr" `
    "latest.json"

Write-Host "`nDone! https://github.com/Piya-Boy/ClawdClock/releases/tag/$tag" -ForegroundColor Green
