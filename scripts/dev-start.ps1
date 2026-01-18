# Development Environment Startup Script
# This script helps start the development environment with Neon Local

param(
    [switch]$Build,
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Stop
)

$ComposeFile = "docker-compose.dev.yml"
$EnvFile = ".env.development"

Write-Host "🚀 Acquisitions Development Environment Manager" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if .env.development exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ $EnvFile not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to $EnvFile and configure your Neon credentials." -ForegroundColor Yellow
    exit 1
}

if ($Stop) {
    Write-Host "🛑 Stopping development environment..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile --env-file $EnvFile down
    exit 0
}

if ($Clean) {
    Write-Host "🧹 Cleaning up development environment..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile --env-file $EnvFile down -v --remove-orphans
    docker system prune -f
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
    exit 0
}

if ($Build) {
    Write-Host "🔨 Building development containers..." -ForegroundColor Blue
    docker-compose -f $ComposeFile --env-file $EnvFile build --no-cache
}

if ($Logs) {
    Write-Host "📋 Following container logs..." -ForegroundColor Blue
    docker-compose -f $ComposeFile --env-file $EnvFile logs -f
    exit 0
}

# Default: Start the development environment
Write-Host "🏗️ Starting development environment with Neon Local..." -ForegroundColor Green
Write-Host "Environment file: $EnvFile" -ForegroundColor Gray

# Start services
docker-compose -f $ComposeFile --env-file $EnvFile up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Development environment started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Services available at:" -ForegroundColor Cyan
    Write-Host "  • Application: http://localhost:3000" -ForegroundColor White
    Write-Host "  • Database (Neon Local): localhost:5432" -ForegroundColor White
    Write-Host "  • Health Check: http://localhost:3000/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Useful commands:" -ForegroundColor Cyan
    Write-Host "  • View logs: .\scripts\dev-start.ps1 -Logs" -ForegroundColor White
    Write-Host "  • Stop services: .\scripts\dev-start.ps1 -Stop" -ForegroundColor White
    Write-Host "  • Clean environment: .\scripts\dev-start.ps1 -Clean" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 The Neon Local proxy creates ephemeral database branches automatically!" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to start development environment!" -ForegroundColor Red
    Write-Host "Check the logs with: docker-compose -f $ComposeFile --env-file $EnvFile logs" -ForegroundColor Yellow
}