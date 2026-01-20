# NestJS Mock Authentication Middleware

A lightweight NestJS authentication middleware that provides JWT-based authentication and role-based access control (RBAC) without cryptographic signature verification. Ideal for development, testing, and prototyping environments.

⚠️ **WARNING**: This is a MOCK implementation that does NOT verify JWT signatures. **DO NOT use in production** without adding proper JWT verification.

## Features

- ✅ JWT token parsing and validation (structure and required claims)
- ✅ User claims extraction (sub, email, roles, exp, iat)
- ✅ Role-based access control with any-of semantics (`@Roles()`)
- ✅ Role-based access control with all-of semantics (`@RequireAllRoles()`)
- ✅ Structured logging with NestJS Logger
- ✅ Custom exceptions with consistent error responses
- ✅ TypeScript-first with strict type checking
- ✅ Zero external dependencies for JWT parsing

## Installation

```bash
npm install @sample-app/nestjs-mock-auth
```

### Peer Dependencies

Ensure you have the following NestJS packages installed:

```bash
npm install @nestjs/common@^11.0.0 @nestjs/core@^11.0.0 reflect-metadata rxjs
```

## Quick Start

### 1. Import the AuthModule

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@sample-app/nestjs-mock-auth';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
})
export class AppModule {}
```

### 2. Protect Routes with AuthGuard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, User, UserClaims } from '@sample-app/nestjs-mock-auth';

@Controller('api')
@UseGuards(AuthGuard)
export class ApiController {
  @Get('profile')
  getProfile(@User() user: UserClaims) {
    return {
      id: user.sub,
      email: user.email,
      roles: user.roles,
    };
  }
}
```

### 3. Add Role-Based Access Control

#### Any-Of Semantics (User needs ONE of the specified roles)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, RequireRolesGuard, Roles } from '@sample-app/nestjs-mock-auth';

@Controller('admin')
@UseGuards(AuthGuard, RequireRolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin', 'moderator')
  getDashboard() {
    // User with 'admin' OR 'moderator' role can access
    return { message: 'Admin dashboard' };
  }
}
```

#### All-Of Semantics (User needs ALL specified roles)

```typescript
import { Controller, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard, RequireAllRolesGuard, RequireAllRoles } from '@sample-app/nestjs-mock-auth';

@Controller('admin')
@UseGuards(AuthGuard, RequireAllRolesGuard)
export class AdminController {
  @Delete('critical-operation')
  @RequireAllRoles('admin', 'superuser')
  criticalOperation() {
    // User must have BOTH 'admin' AND 'superuser' roles
    return { message: 'Operation complete' };
  }
}
```

## API Reference

### Guards

#### `AuthGuard`

Validates JWT tokens and attaches user claims to the request.

- Extracts Bearer token from `Authorization` header
- Parses JWT payload and validates structure
- Attaches `UserClaims` to `request.user`
- Throws `InvalidTokenException` (401) if token is missing or invalid

#### `RequireRolesGuard`

Enforces any-of role semantics. User must have at least ONE of the specified roles.

- Reads roles from `@Roles()` decorator
- Throws `InsufficientPermissionsException` (403) if user lacks all required roles
- Must be used after `AuthGuard`

#### `RequireAllRolesGuard`

Enforces all-of role semantics. User must have ALL of the specified roles.

- Reads roles from `@RequireAllRoles()` decorator
- Throws `InsufficientPermissionsException` (403) if user lacks any required role
- Must be used after `AuthGuard`

### Decorators

#### `@User(property?: keyof UserClaims)`

Parameter decorator to extract user claims from request.

```typescript
// Get entire UserClaims object
@Get('profile')
getProfile(@User() user: UserClaims) { }

// Get specific property
@Get('email')
getEmail(@User('email') email: string) { }

@Get('roles')
getRoles(@User('roles') roles: string[]) { }
```

#### `@Roles(...roles: string[])`

Route decorator for any-of role requirements.

```typescript
@Roles('admin', 'moderator')
@Get('dashboard')
getDashboard() { }
```

#### `@RequireAllRoles(...roles: string[])`

Route decorator for all-of role requirements.

```typescript
@RequireAllRoles('admin', 'superuser')
@Delete('critical')
criticalOperation() { }
```

### Interfaces

#### `UserClaims`

```typescript
interface UserClaims {
  sub: string;        // User ID (required)
  email: string;      // User email (required)
  roles: string[];    // User roles (defaults to [] if missing)
  exp?: number;       // Token expiration (Unix timestamp)
  iat?: number;       // Token issued at (Unix timestamp)
}
```

#### `AuthError`

```typescript
interface AuthError {
  statusCode: number;   // HTTP status code (401 or 403)
  code: string;         // Error code (INVALID_TOKEN or INSUFFICIENT_PERMISSIONS)
  message: string;      // Human-readable error message
  timestamp: string;    // ISO 8601 timestamp
  path: string;         // Request path
}
```

### Exceptions

#### `InvalidTokenException` (401 Unauthorized)

Thrown when:
- Authorization header is missing
- Token format is invalid (not Bearer scheme or not 3 parts)
- Token payload cannot be decoded
- Required claims (sub, email) are missing

#### `InsufficientPermissionsException` (403 Forbidden)

Thrown when:
- User lacks required roles

## Token Format

The middleware expects JWT tokens in the `Authorization` header with Bearer scheme:

```
Authorization: Bearer <token>
```

Token structure (3 parts separated by dots):

```
<header>.<payload>.<signature>
```

Example payload:

```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "roles": ["admin", "user"],
  "exp": 1735689600,
  "iat": 1735603200
}
```

## Edge Cases & Behavior

### Missing Roles Claim

If the `roles` claim is missing or not an array, defaults to empty array `[]` (permissive behavior).

### Expired Tokens

Expired tokens (where `exp < current time`) are **ACCEPTED** with a warning log. This is intentional for development environments.

### Role Case Sensitivity

Role comparisons are **case-sensitive**:
- `"admin"` ≠ `"Admin"` ≠ `"ADMIN"`

### Empty Roles Decorator

If `@Roles()` or `@RequireAllRoles()` is used with no arguments, the guard allows access (no roles required).

## Logging

The middleware uses NestJS Logger with structured JSON output:

```typescript
// Authentication success
{
  "level": "log",
  "message": "Authentication successful",
  "userId": "user-123",
  "email": "user@example.com",
  "rolesCount": 2,
  "path": "/api/profile",
  "method": "GET"
}

// Authorization failure
{
  "level": "warn",
  "message": "Authorization failed: insufficient roles",
  "userId": "user-123",
  "userRoles": ["user"],
  "requiredRoles": ["admin", "moderator"],
  "path": "/admin/dashboard",
  "method": "GET"
}
```

**Security**: Logs contain user IDs and role counts but **NOT** JWT tokens or sensitive claim data.

## Production Migration

⚠️ **This middleware does NOT verify JWT signatures** and should only be used in development/testing environments.

For production use, you must:

1. **Add signature verification** using a library like `jsonwebtoken` or `passport-jwt`
2. **Validate token issuer** (iss claim) against trusted issuers
3. **Validate audience** (aud claim) to prevent token misuse
4. **Use HTTPS** for all API endpoints
5. **Implement token rotation** and revocation mechanisms
6. **Add rate limiting** to prevent brute force attacks
7. **Store secrets securely** (environment variables, secret managers)

See [quickstart.md](./specs/001-nestjs-mock-auth/quickstart.md) for detailed production migration guidance.

## Requirements

- **Node.js**: v20 LTS (minimum v16+)
- **NestJS**: v11.x
- **TypeScript**: v5.x

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All code passes TypeScript strict mode
- Unit tests achieve 90%+ coverage
- JSDoc comments for all public APIs
- No sensitive data in logs

## Support

For issues and questions, please file a GitHub issue.

---

**Remember**: This is a MOCK authentication middleware. Do not use in production without proper JWT signature verification.
