import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALL_ROLES_KEY } from '../decorators/require-all-roles.decorator';
import { UserClaims } from '../models/user-claims.interface';
import { InsufficientPermissionsException } from '../exceptions/insufficient-permissions.exception';

/**
 * RequireAllRolesGuard
 * 
 * NestJS guard that enforces role-based access control with all-of semantics.
 * Checks if the authenticated user has ALL of the required roles.
 * 
 * Must be used with AuthGuard (AuthGuard must run first to populate request.user).
 * 
 * Usage:
 * ```typescript
 * @Controller('admin')
 * @UseGuards(AuthGuard, RequireAllRolesGuard)
 * export class AdminController {
 *   @Delete('critical')
 *   @RequireAllRoles('admin', 'superuser')
 *   criticalOperation() {
 *     return { message: 'Operation complete' };
 *   }
 * }
 * ```
 */
@Injectable()
export class RequireAllRolesGuard implements CanActivate {
  private readonly logger = new Logger(RequireAllRolesGuard.name);

  constructor(private reflector: Reflector) {}

  /**
   * Validates that the user has all of the required roles
   * 
   * @param context - Execution context containing request and route metadata
   * @returns true if user has all required roles, throws exception otherwise
   * @throws InsufficientPermissionsException if user lacks any required role
   */
  canActivate(context: ExecutionContext): boolean {
    // FR-008: Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ALL_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      // Edge case: Log warning when @RequireAllRoles() is used with no arguments
      if (requiredRoles !== undefined && requiredRoles.length === 0) {
        const request = context.switchToHttp().getRequest();
        this.logger.warn('RequireAllRolesGuard used with empty roles array', {
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
      this.logger.error('RequireAllRolesGuard called without authenticated user', {
        path: request.url,
        requiredRoles,
      });
      throw new InsufficientPermissionsException('User must be authenticated to check roles');
    }

    // FR-008: Check if user has ALL required roles (all-of semantics)
    // FR-012: Role comparison is case-sensitive
    const missingRoles = requiredRoles.filter((role) => !user.roles.includes(role));

    if (missingRoles.length > 0) {
      // FR-009, FR-012: Throw 403 with missing roles in message
      const message = `User lacks required roles. Missing: [${missingRoles.join(', ')}]`;
      
      this.logger.warn('Authorization failed: missing required roles', {
        userId: user.sub,
        userRoles: user.roles,
        requiredRoles,
        missingRoles,
        path: request.url,
        method: request.method,
      });

      throw new InsufficientPermissionsException(message);
    }

    // Log successful authorization
    this.logger.log('Authorization successful (all-of)', {
      userId: user.sub,
      userRolesCount: user.roles.length,
      requiredRoles,
      path: request.url,
      method: request.method,
    });

    return true;
  }
}
