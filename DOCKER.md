# Docker Setup Guide - Acquisitions API with Neon Database

This guide explains how to run the Acquisitions API using Docker with different database configurations for development and production environments.

## 🏗️ Architecture Overview

### Development Environment
- **Application**: Node.js Express API (containerized)
- **Database**: Neon Local proxy (containerized) → Neon Cloud
- **Features**: Hot reloading, ephemeral database branches, debug logging

### Production Environment  
- **Application**: Node.js Express API (containerized, optimized)
- **Database**: Direct connection to Neon Cloud
- **Features**: Optimized build, security hardening, resource limits

## 📋 Prerequisites

1. **Docker & Docker Compose** installed
2. **Neon Account** with a project created
3. **Environment Variables** configured (see setup section)

## 🚀 Quick Start

### Development Environment

1. **Get your Neon credentials** from [Neon Console](https://console.neon.com):
   - `NEON_API_KEY`: Your API key
   - `NEON_PROJECT_ID`: Your project ID  
   - `PARENT_BRANCH_ID`: Main branch ID (usually `main` or `master`)

2. **Configure environment**:
   ```powershell
   # Copy the example environment file
   Copy-Item .env.example .env.development
   
   # Edit .env.development with your Neon credentials
   notepad .env.development
   ```

3. **Start development environment**:
   ```powershell
   # Using the helper script (recommended)
   .\scripts\dev-start.ps1
   
   # Or manually with Docker Compose
   docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
   ```

4. **Access your application**:
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - Database: localhost:5432 (via Neon Local proxy)

### Production Environment

1. **Configure production environment**:
   ```powershell
   # Copy the example environment file
   Copy-Item .env.example .env.production
   
   # Edit .env.production with your Neon Cloud database URL
   notepad .env.production
   ```

2. **Deploy to production**:
   ```powershell
   # Build and deploy using helper script
   .\scripts\prod-deploy.ps1 -Build
   .\scripts\prod-deploy.ps1 -Deploy
   
   # Or manually with Docker Compose
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

## ⚙️ Environment Configuration

### Development (.env.development)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database - Neon Local Proxy
DATABASE_URL=postgres://neondb_owner:password@neon-local:5432/neondb

# Neon Local Configuration
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here  
PARENT_BRANCH_ID=your_parent_branch_id_here

# JWT Configuration
JWT_SECRET=development-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Production (.env.production)
```bash
# Server Configuration  
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database - Direct Neon Cloud Connection
DATABASE_URL=postgres://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=production-jwt-secret-change-this-to-strong-random-key
JWT_EXPIRES_IN=1h

# Security Settings
TRUST_PROXY=true
ENABLE_CORS=false
```

## 🛠️ Development Workflow

### Starting Development
```powershell
# Start with automatic ephemeral branch creation
.\scripts\dev-start.ps1

# Start with rebuild
.\scripts\dev-start.ps1 -Build

# View logs
.\scripts\dev-start.ps1 -Logs
```

### Development Features
- **Hot Reloading**: Source code changes automatically restart the app
- **Ephemeral Branches**: Each container startup creates a fresh database branch
- **Debug Logging**: Detailed logs for development and debugging
- **Volume Mounting**: Source code mounted for instant updates

### Managing Development Environment
```powershell
# Stop development environment
.\scripts\dev-start.ps1 -Stop

# Clean up (removes volumes and containers)
.\scripts\dev-start.ps1 -Clean

# Check container status
docker-compose -f docker-compose.dev.yml ps
```

## 🚀 Production Deployment

### Production Build Process
```powershell
# Build optimized production containers
.\scripts\prod-deploy.ps1 -Build

# Deploy to production
.\scripts\prod-deploy.ps1 -Deploy

# Check deployment status
.\scripts\prod-deploy.ps1 -Status
```

### Production Features
- **Multi-stage Build**: Optimized image size and security
- **Non-root User**: Runs as nodejs user (UID 1001)
- **Resource Limits**: CPU and memory constraints
- **Health Checks**: Automated container health monitoring
- **Security Hardening**: Read-only filesystem, dropped capabilities

### Production Monitoring
```powershell
# View production logs
.\scripts\prod-deploy.ps1 -Logs

# Check service status
.\scripts\prod-deploy.ps1 -Status

# Stop production services
.\scripts\prod-deploy.ps1 -Stop
```

## 🔧 Manual Docker Commands

### Development
```powershell
# Build development image
docker-compose -f docker-compose.dev.yml build

# Start services
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production
```powershell
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start services  
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 🗃️ Database Management

### Neon Local (Development)
- **Automatic Branches**: Creates ephemeral branches on container start
- **Branch Lifecycle**: Branches are deleted when container stops
- **Data Persistence**: Data is temporary (perfect for testing)
- **Connection**: App connects to `neon-local:5432` via Docker network

### Neon Cloud (Production)
- **Direct Connection**: App connects directly to Neon Cloud
- **Persistent Data**: Production database with backup/restore
- **SSL Required**: Secure connections with `?sslmode=require`
- **Connection Pooling**: Built-in connection optimization

## 🔍 Troubleshooting

### Common Issues

**1. Neon Local fails to start**
```powershell
# Check Neon credentials
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify API key and project ID in .env.development
```

**2. Application can't connect to database**
```powershell
# Check if Neon Local is healthy
docker-compose -f docker-compose.dev.yml ps

# Verify DATABASE_URL format
```

**3. Permission errors in production**
```powershell
# Check if logs directory exists and has proper permissions
mkdir logs
icacls logs /grant Everyone:F
```

**4. Build failures**
```powershell
# Clean Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache
```

### Health Checks
```powershell
# Application health check
curl http://localhost:3000/health

# Database connectivity (development)
docker exec acquisitions-neon-local pg_isready -h localhost -p 5432

# Container status
docker ps --filter "name=acquisitions"
```

### Log Locations
- **Development**: Container logs via `docker-compose logs`
- **Production**: Persistent logs in `./logs` directory
- **Database**: Neon dashboard for cloud logs

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test both development and production builds
2. Update environment examples when adding new variables
3. Ensure backward compatibility with existing deployments
4. Document any breaking changes in deployment process

---

**Need Help?** Check the troubleshooting section above or refer to the project's main documentation.