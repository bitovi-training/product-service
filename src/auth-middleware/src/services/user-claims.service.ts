import { Injectable } from '@nestjs/common';
import { UserClaims } from '../models/user-claims.interface';

/**
 * UserClaimsService
 * 
 * Provides helper methods for accessing user claims from request context.
 * This is a utility service - the @User() decorator is the recommended way to access claims.
 */
@Injectable()
export class UserClaimsService {
  /**
   * Get user claims from request object
   * 
   * @param request - Express request object with user claims attached by AuthGuard
   * @returns UserClaims if user is authenticated, null otherwise
   * 
   * @example
   * ```typescript
   * @Injectable()
   * export class MyService {
   *   constructor(private userClaimsService: UserClaimsService) {}
   * 
   *   processData(request: Request) {
   *     const user = this.userClaimsService.getUserClaims(request);
   *     if (user) {
   *       console.log(`Processing for user: ${user.sub}`);
   *     }
   *   }
   * }
   * ```
   */
  getUserClaims(request: Request & { user?: UserClaims }): UserClaims | null {
    return request.user || null;
  }
}

/**
 * GetUserClaims Helper Function
 * 
 * Standalone helper function to retrieve user claims from request context.
 * Returns null if user is not authenticated.
 * 
 * @param request - Express request object
 * @returns UserClaims if authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * import { GetUserClaims } from '@sample-app/nestjs-mock-auth';
 * 
 * function processRequest(request: Request) {
 *   const user = GetUserClaims(request);
 *   if (user) {
 *     console.log(`User ${user.sub} has roles: ${user.roles.join(', ')}`);
 *   } else {
 *     console.log('Unauthenticated request');
 *   }
 * }
 * ```
 */
export function GetUserClaims(request: Request & { user?: UserClaims }): UserClaims | null {
  return request.user || null;
}
