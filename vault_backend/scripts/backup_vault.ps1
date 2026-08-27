# backup_vault.ps1
# Windows PowerShell implementation of the database backup and encryption recovery script (Part 15)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# 1. Load database parameters from .env file
$envPath = Join-Path $projectRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Error "Error: .env file not found at $envPath. Cannot proceed with backup."
    Exit 1
}

# Default parameters
$dbName = "vault_db"
$dbUser = "postgres"
$dbPass = ""
$dbHost = "localhost"
$dbPort = "5432"

Get-Content $envPath | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
    $parts = $_.Split('=', 2)
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    
    # Strip optional quotes from value
    if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
        $value = $value.Substring(1, $value.Length - 2)
    }
    
    if ($key -eq "DB_NAME") { $dbName = $value }
    elseif ($key -eq "DB_USER") { $dbUser = $value }
    elseif ($key -eq "DB_PASSWORD") { $dbPass = $value }
    elseif ($key -eq "DB_HOST") { $dbHost = $value }
    elseif ($key -eq "DB_PORT") { $dbPort = $value }
}

# 2. Configure Backup Directories
$backupDir = Join-Path $projectRoot "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Write-Host "Created backups directory at $backupDir"
}

$dateStr = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $backupDir "${dbName}_${dateStr}.sql"
$encryptedFile = "${backupFile}.gpg"
$passphraseFile = Join-Path $scriptPath ".backup_passphrase"

# Ensure passphrase file exists for GPG encryption
if (-not (Test-Path $passphraseFile)) {
    # Generate a cryptographically secure random 32-byte hex passphrase
    $bytes = New-Object Byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $randomPass = [System.BitConverter]::ToString($bytes) -replace '-'
    $randomPass | Out-File -FilePath $passphraseFile -Encoding ascii -NoNewline
    Write-Host "Generated new secure backup passphrase at $passphraseFile"
}

Write-Host "Starting database backup for $dbName..."

# 3. Dump the database using pg_dump
$env:PGPASSWORD = $dbPass
try {
    # Search for pg_dump.exe in common PostgreSQL install paths if not in PATH
    $pgDumpPath = "pg_dump.exe"
    $hasPgDump = Get-Command $pgDumpPath -ErrorAction SilentlyContinue
    if (-not $hasPgDump) {
        $commonPaths = @(
            Get-ChildItem "C:\Program Files\PostgreSQL" -ErrorAction SilentlyContinue | 
            ForEach-Object { Join-Path $_.FullName "bin\pg_dump.exe" } |
            Where-Object { Test-Path $_ }
        )
        if ($commonPaths -and $commonPaths.Count -gt 0) {
            $pgDumpPath = $commonPaths[0]
            Write-Host "Found pg_dump at $pgDumpPath"
        } else {
            throw "pg_dump.exe utility was not found in PATH or standard installation directory. Please install PostgreSQL command-line tools."
        }
    }

    # Execute pg_dump
    & $pgDumpPath -h $dbHost -p $dbPort -U $dbUser -F p -f $backupFile -d $dbName
    
    if (-not (Test-Path $backupFile) -or (Get-Item $backupFile).Length -eq 0) {
        throw "Database dump failed. File is empty or was not created."
    }
    Write-Host "Database successfully dumped to $backupFile"
}
catch {
    Write-Error "Backup failed: $_"
    $env:PGPASSWORD = $null
    Exit 1
}
$env:PGPASSWORD = $null

# 4. Encrypt the backup symmetrically using GnuPG
$hasGpg = Get-Command "gpg.exe" -ErrorAction SilentlyContinue
if ($hasGpg) {
    try {
        & gpg --batch --yes --passphrase-file $passphraseFile --symmetric --cipher-algo AES256 -o $encryptedFile $backupFile
        Write-Host "Symmetrically encrypted database backup to $encryptedFile"
        
        # Verify encrypted file exists and has size
        if ((Test-Path $encryptedFile) -and (Get-Item $encryptedFile).Length -gt 0) {
            # Remove the plaintext SQL file immediately
            Remove-Item $backupFile -Force
            Write-Host "Removed plaintext SQL dump to limit exposure."
        } else {
            throw "Encryption failed: encrypted file was empty or not created."
        }
    }
    catch {
        Write-Error "Encryption failed: $_"
        Exit 1
    }
} else {
    Write-Warning "GnuPG (gpg.exe) was not found in PATH. Backup remains plaintext at $backupFile."
    Write-Warning "For production security, please install Gpg4win (https://www.gpg4win.org/) so GPG encryption can run."
}

# 5. Clean up old backups (older than 30 days)
Write-Host "Cleaning up backups older than 30 days..."
$cutoffDate = (Get-Date).AddDays(-30)

$removedCount = 0
Get-ChildItem $backupDir -File | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-Host "Removed expired backup: $($_.Name)"
    $removedCount++
}

Write-Host "Backup process completed. Removed $removedCount expired files."
