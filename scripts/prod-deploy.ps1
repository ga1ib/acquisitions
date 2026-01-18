# Production Deployment Script
# This script helps deploy the application to production with Neon Cloud

param(
    [switch]$Build,
    [switch]$Deploy,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Status
)

$ComposeFile = "docker-compose.prod.yml"
$EnvFile = ".env.production"

Write-Host "🚀 Acquisitions Production Deployment Manager" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if .env.production exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ $EnvFile not found!" -ForegroundColor Red
    Write-Host "Please create $EnvFile with your production configuration." -ForegroundColor Yellow
    exit 1
}

# Validate required environment variables
$env_content = Get-Content $EnvFile -Raw
if (-not ($env_content -match "DATABASE_URL=postgres://.*neon.tech.*")) {
    Write-Host "⚠️ Warning: DATABASE_URL doesn't appear to be a valid Neon Cloud URL" -ForegroundColor Yellow
    Write-Host "Expected format: postgres://username:password@ep-xxx.region.aws.neon.tech/dbname" -ForegroundColor Gray
}

if ($Status) {
    Write-Host "📊 Checking production service status..." -ForegroundColor Blue
    docker-compose -f $ComposeFile --env-file $EnvFile ps
    exit 0
}

if ($Stop) {
    Write-Host "🛑 Stopping production services..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile --env-file $EnvFile down
    Write-Host "✅ Production services stopped!" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    Write-Host "📋 Following production logs..." -ForegroundColor Blue
    docker-compose -f $ComposeFile --env-file $EnvFile logs -f
    exit 0
}

if ($Build) {
    Write-Host "🔨 Building production containers..." -ForegroundColor Blue
    docker-compose -f $ComposeFile --env-file $EnvFile build --no-cache
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Production build completed!" -ForegroundColor Green
}

if ($Deploy) {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Green
    Write-Host "Environment file: $EnvFile" -ForegroundColor Gray
    
    # Pull latest images if needed
    docker-compose -f $ComposeFile --env-file $EnvFile pull
    
    # Deploy with zero-downtime if possible
    docker-compose -f $ComposeFile --env-file $EnvFile up -d --remove-orphans
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Production deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Production services:" -ForegroundColor Cyan
        Write-Host "  • Application: http://localhost:3000" -ForegroundColor White
        Write-Host "  • Database: Neon Cloud (external)" -ForegroundColor White
        Write-Host "  • Health Check: http://localhost:3000/health" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 Management commands:" -ForegroundColor Cyan
        Write-Host "  • View logs: .\scripts\prod-deploy.ps1 -Logs" -ForegroundColor White
        Write-Host "  • Check status: .\scripts\prod-deploy.ps1 -Status" -ForegroundColor White
        Write-Host "  • Stop services: .\scripts\prod-deploy.ps1 -Stop" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️ Production Note: Using Neon Cloud database directly" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Production deployment failed!" -ForegroundColor Red
        Write-Host "Check logs with: .\scripts\prod-deploy.ps1 -Logs" -ForegroundColor Yellow
    }
}

# Default behavior - show help
if (-not ($Build -or $Deploy -or $Stop -or $Logs -or $Status)) {
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\scripts\prod-deploy.ps1 -Build    # Build production containers" -ForegroundColor Gray
    Write-Host "  .\scripts\prod-deploy.ps1 -Deploy   # Deploy to production" -ForegroundColor Gray
    Write-Host "  .\scripts\prod-deploy.ps1 -Stop     # Stop production services" -ForegroundColor Gray
    Write-Host "  .\scripts\prod-deploy.ps1 -Logs     # View production logs" -ForegroundColor Gray
    Write-Host "  .\scripts\prod-deploy.ps1 -Status   # Check service status" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Example workflow:" -ForegroundColor Cyan
    Write-Host "  1. .\scripts\prod-deploy.ps1 -Build" -ForegroundColor Gray
    Write-Host "  2. .\scripts\prod-deploy.ps1 -Deploy" -ForegroundColor Gray
}