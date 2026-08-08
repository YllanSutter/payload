param(
  [int]$timeoutSeconds = 120
)

Write-Host "Starting docker-compose..."
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
  Write-Error "docker-compose failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

# Detect DB type from .env (DATABASE_URL) and choose port to wait on
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $scriptDir "..\.env"
$dbUrl = ""
if (Test-Path $envPath) {
  $line = Get-Content $envPath | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
  if ($line) { $dbUrl = $line -replace '^DATABASE_URL\s*=\s*', '' -replace '"','' }
}

$port = 27017
if ($dbUrl -match 'postgres' -or $dbUrl -match 'postgresql') { $port = 5432 }

Write-Host "Waiting for DB on 127.0.0.1:$port (detected from DATABASE_URL: $dbUrl)"

$start = Get-Date
$res = $null
while (((Get-Date) - $start).TotalSeconds -lt $timeoutSeconds) {
  try {
    $res = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
  } catch {
    $res = $null
  }
  if ($res -and $res.TcpTestSucceeded) {
    Write-Host "DB is up on port $port"
    break
  }
  Write-Host "Waiting for DB on 127.0.0.1:$port..."
  Start-Sleep -Seconds 2
}

if (-not ($res -and $res.TcpTestSucceeded)) {
  Write-Error "Timed out waiting for Postgres after $timeoutSeconds seconds"
  Write-Host "Gathering Docker diagnostics..."
  try {
    Write-Host "docker ps"
    docker ps
  } catch {
    Write-Host "Failed to run 'docker ps': $_"
  }
  try {
    Write-Host "docker-compose ps"
    docker-compose ps
  } catch {
    Write-Host "Failed to run 'docker-compose ps': $_"
  }
  try {
    Write-Host "--- Logs: postgres ---"
    docker-compose logs postgres --tail 200
  } catch {
    Write-Host "Failed to fetch postgres logs: $_"
  }
  try {
    Write-Host "--- Logs: payload ---"
    docker-compose logs payload --tail 200
  } catch {
    Write-Host "Failed to fetch payload logs: $_"
  }
  exit 1
}

Write-Host "Starting dev server (pnpm run dev)..."
pnpm run dev
