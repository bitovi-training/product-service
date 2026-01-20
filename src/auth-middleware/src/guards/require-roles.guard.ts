import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserClaims } from '../models/user-claims.interface';
import { InsufficientPermissionsException } from '../exceptions/insufficient-permissions.exception';

/**
 * RequireRolesGuard
 * 
 * NestJS guard that enforces role-based access control with any-of semantics.
 * Checks if the authenticated user has at least one of the required roles.
 * 
 * Must be used with AuthGuard (AuthGuard must run first to populate request.user).
 * 
 * Usage:
 * ```typescript
 * @Controller('admin')
 * @UseGuards(AuthGuard, RequireRolesGuard)
 * export class AdminController {
 *   @Get('dashboard')
 *   @Roles('admin', 'moderator')
 *   getDashboard() {
 *     return { message: 'Admin dashboard' };
 *   }
 * }
 * ```
 */
@Injectable()
export class RequireRolesGuard implements CanActivate {
  private readonly logger = new Logger(RequireRolesGuard.name);

  constructor(private reflector: Reflector) {}

  /**
   * Validates that the user has at least one of the required roles
   * 
   * @param context - Execution context containing request and route metadata
   * @returns true if user has required role, throws exception otherwise
   * @throws InsufficientPermissionsException if user lacks all required roles
   */
  canActivate(context: ExecutionContext): boolean {
    // FR-007: Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      // Edge case: Log warning when @Roles() is used with no arguments
      if (requiredRoles !== undefined && requiredRoles.length === 0) {
        const request = context.switchToHttp().getRequest();
        this.logger.warn('RequireRolesGuard used with empty roles array', {
          path: request.url,
          method: request.method,
        });
      }
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserClaims = request.user;

    // User should be authenticated by AuthGuard before this guard runs
    if (!user) {
      this.logger.error('RequireRolesGuard called without authenticated user', {
        path: request.url,
        requiredRoles,
      });
      throw new InsufficientPermissionsException('User must be authenticated to check roles');
    }

    // FR-007: Check if user has at least one required role (any-of semantics)
    // FR-012: Role comparison is case-sensitive
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRequiredRole) {
      // FR-009, FR-012: Throw 403 with required roles in message
      const message = `User lacks required role. Required one of: [${requiredRoles.join(', ')}]`;
      
      this.logger.warn('Authorization failed: insufficient roles', {
        userId: user.sub,
        userRoles: user.roles,
        requiredRoles,
        path: request.url,
        method: request.method,
      });

      throw new InsufficientPermissionsException(message);
    }

    // Log successful authorization
    this.logger.log('Authorization successful', {
      userId: user.sub,
      userRolesCount: user.roles.length,
      requiredRoles,
      path: request.url,
      method: request.method,
    });

    return true;
  }
}
