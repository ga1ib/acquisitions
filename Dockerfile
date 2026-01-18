# Multi-stage Dockerfile for Node.js application with Neon Database
# Supports both development and production environments

# ================================
# Base Stage - Common Dependencies
# ================================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# ================================
# Dependencies Stage
# ================================
FROM base AS deps

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# ================================
# Development Stage
# ================================
FROM base AS development

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodejs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application in development mode
CMD ["dumb-init", "npm", "run", "dev"]

# ================================
# Build Stage (for production)
# ================================
FROM base AS build

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Run any build steps if needed (currently none for this app)
# RUN npm run build

# Prune dev dependencies for production
RUN npm prune --omit=dev

# ================================
# Production Stage
# ================================
FROM base AS production

# Copy production dependencies
COPY --from=build /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodejs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application in production mode
CMD ["dumb-init", "node", "src/index.js"]
