import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for all-required roles
 * Used by RequireAllRolesGuard to retrieve required roles from route metadata
 */
export const ALL_ROLES_KEY = 'all_roles';

/**
 * @RequireAllRoles() Decorator
 * 
 * Marks a route as requiring ALL specified roles for access (all-of semantics).
 * User must have EVERY ONE of the specified roles to access the endpoint.
 * 
 * Must be used in combination with RequireAllRolesGuard.
 * 
 * @param roles - All role names that user must have to access this endpoint
 * 
 * @example
 * ```typescript
 * @Controller('admin')
 * @UseGuards(AuthGuard, RequireAllRolesGuard)
 * export class AdminController {
 *   // User needs BOTH 'admin' AND 'superuser' roles
 *   @Delete('critical-operation')
 *   @RequireAllRoles('admin', 'superuser')
 *   criticalOperation() {
 *     return { message: 'Critical operation executed' };
 *   }
 * 
 *   // User needs 'admin', 'auditor', AND 'finance' roles
 *   @Get('financial-audit')
 *   @RequireAllRoles('admin', 'auditor', 'finance')
 *   getFinancialAudit() {
 *     return { data: 'audit data' };
 *   }
 * }
 * ```
 */
export const RequireAllRoles = (...roles: string[]) => SetMetadata(ALL_ROLES_KEY, roles);
