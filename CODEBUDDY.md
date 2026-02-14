# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

This is a full-stack User Authentication System with a monorepo structure. The project separates concerns into three main directories:

- `backend/` - Server-side authentication logic and APIs
- `frontend/` - User interface for authentication flows
- `docs/` - Project documentation

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature-specific branches (e.g., `feature/backend-init`, `feature/frontend-init`)

When implementing features:
1. Create a feature branch from `develop`
2. Make changes and commit
3. Create pull requests to merge back to `develop`
4. Once validated, merge from `develop` to `main`

## Architecture

### Monorepo Structure

The project uses a clear separation of concerns:

- Backend and frontend are developed independently but share the same repository
- This allows for independent deployment and scaling
- Documentation is maintained alongside the code for better context

### Technology Considerations

Based on the `.gitignore` file, the project is designed for the Node.js ecosystem and may use modern JavaScript frameworks such as:

- **Frontend**: Next.js, React, Vue, or similar
- **Backend**: Node.js with Express or similar frameworks

When choosing technologies:
- Prioritize TypeScript for type safety
- Consider using authentication libraries (e.g., Passport.js, Auth0, Firebase Auth)
- Ensure proper security practices for password hashing, JWT tokens, etc.

## File Organization

### Environment Configuration

- Environment files (`.env`, `.env.local`, etc.) are gitignored
- Use `.env.example` to document required environment variables
- Never commit sensitive information (API keys, secrets, passwords)

### Build Artifacts

The following are gitignored and should not be committed:
- Dependency directories (`node_modules/`)
- Build outputs (`dist/`, `build/`, `.next/`)
- Cache files (`.eslintcache`, `*.tsbuildinfo`)
- Test coverage reports (`coverage/`)

## Development Guidelines

### When Adding New Features

1. Determine if the feature belongs in backend, frontend, or both
2. Make changes in the appropriate directory
3. Update documentation in `docs/` as needed
4. Ensure environment variables are documented in `.env.example`

### Security Considerations

Since this is an authentication system, pay special attention to:
- Never log sensitive information (passwords, tokens)
- Always hash passwords before storage
- Use secure token generation and validation
- Implement rate limiting for authentication endpoints
- Keep dependencies updated to avoid security vulnerabilities

## Project Status

This project is currently in the initial setup phase. The directory structure is established, but implementation has not begun yet. Future development will focus on:

- Setting up the technology stack
- Implementing core authentication features (registration, login, logout)
- Adding token-based authentication (JWT or similar)
- Creating user management interfaces
- Implementing password reset functionality
