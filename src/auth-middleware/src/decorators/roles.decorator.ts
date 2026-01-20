import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for roles
 * Used by RequireRolesGuard to retrieve required roles from route metadata
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles() Decorator
 * 
 * Marks a route as requiring one or more roles for access (any-of semantics).
 * User must have AT LEAST ONE of the specified roles to access the endpoint.
 * 
 * Must be used in combination with RequireRolesGuard.
 * 
 * @param roles - One or more role names that are allowed to access this endpoint
 * 
 * @example
 * ```typescript
 * @Controller('admin')
 * @UseGuards(AuthGuard, RequireRolesGuard)
 * export class AdminController {
 *   // User needs 'admin' OR 'moderator' role
 *   @Get('dashboard')
 *   @Roles('admin', 'moderator')
 *   getDashboard() {
 *     return { message: 'Admin dashboard' };
 *   }
 * 
 *   // User needs 'admin' role only
 *   @Delete('user/:id')
 *   @Roles('admin')
 *   deleteUser(@Param('id') id: string) {
 *     return { deleted: id };
 *   }
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
