# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js backend API service called "acquisitions" built with Express.js, using a modern stack with Drizzle ORM, Neon PostgreSQL database, and comprehensive authentication system.

## Development Commands

### Core Commands
- **Start development server**: `npm run dev` - Runs with `--watch` for auto-restart
- **Lint code**: `npm run lint` - Check for linting errors
- **Fix lint issues**: `npm run lint:fix` - Auto-fix linting errors
- **Format code**: `npm run format` - Format with Prettier
- **Check formatting**: `npm run format:check` - Verify Prettier formatting

### Database Commands
- **Generate migrations**: `npm run db:generate` - Create Drizzle migrations from schema changes
- **Run migrations**: `npm run db:migrate` - Apply pending migrations to database
- **Database studio**: `npm run db:studio` - Open Drizzle Studio for database management

## Architecture

### Directory Structure
```
src/
├── config/          # Configuration files (database, logger)
├── controllers/     # Route handlers and business logic
├── middleware/      # Express middleware (currently empty)
├── models/          # Drizzle ORM database schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions (JWT, cookies, formatting)
├── validations/     # Zod validation schemas
├── app.js           # Express app configuration
├── index.js         # Entry point with dotenv config
└── server.js        # Server startup
```

### Tech Stack
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js v5.x
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: JWT tokens with bcrypt password hashing
- **Logging**: Winston logger with file and console transports
- **Security**: Helmet, CORS, cookie-parser
- **Code Quality**: ESLint, Prettier

### Key Patterns

#### Database Layer
- Uses Drizzle ORM with Neon serverless PostgreSQL
- Database connection configured in `src/config/database.js`
- Models defined in `src/models/` using Drizzle schema definitions
- Migrations managed through `drizzle-kit`

#### Authentication Flow
- JWT-based authentication with secure HTTP-only cookies
- Password hashing with bcrypt (salt rounds: 10)
- User roles: 'user' (default) and 'admin'
- Validation with Zod schemas in `src/validations/`

#### Error Handling
- Winston logging configured with different levels (error, info)
- Logs written to `logs/error.log` and `logs/combined.log`
- Console logging in non-production environments
- Validation error formatting utility

#### Code Standards
- ES6+ with modern JavaScript features
- 2-space indentation, single quotes, semicolons required
- Unix line endings (LF)
- No unused variables except those prefixed with `_`

## Environment Configuration

Required environment variables (see `.env.example`):
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Winston log level (default: info)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time (default: 1h)

## Current State

### Implemented Features
- Express server with security middleware (helmet, CORS)
- Database connection with Drizzle ORM
- User model with authentication fields
- JWT token generation and verification utilities
- Cookie management utilities
- Input validation with Zod
- Winston logging configuration
- Health check endpoints (`/` and `/health`)

### Known Issues
- Auth controller has import path errors (references non-existent files)
- Auth routes are not connected to controllers (placeholder responses)
- Auth service has syntax errors in database queries
- Missing middleware implementation
- No test framework setup

### Next Development Steps
When working on this codebase:
1. Fix import paths in auth controller
2. Connect auth routes to controller functions
3. Implement proper authentication middleware
4. Add comprehensive error handling middleware
5. Set up test framework and write tests
6. Implement additional API endpoints beyond authentication