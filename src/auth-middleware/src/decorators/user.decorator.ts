import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserClaims } from '../models/user-claims.interface';

/**
 * @User() Parameter Decorator
 * 
 * Extracts the authenticated user's claims from the request object.
 * Must be used on routes protected by AuthGuard.
 * 
 * @example
 * ```typescript
 * @Controller('api')
 * @UseGuards(AuthGuard)
 * export class ApiController {
 *   @Get('profile')
 *   getProfile(@User() user: UserClaims) {
 *     return {
 *       id: user.sub,
 *       email: user.email,
 *       roles: user.roles
 *     };
 *   }
 * 
 *   // Access specific claim property
 *   @Get('email')
 *   getEmail(@User('email') email: string) {
 *     return { email };
 *   }
 * }
 * ```
 * 
 * @param data - Optional property name to extract specific claim (e.g., 'sub', 'email', 'roles')
 * @param ctx - Execution context (provided by NestJS)
 * @returns Complete UserClaims object or specific property if data parameter is provided
 */
export const User = createParamDecorator(
  (data: keyof UserClaims | undefined, ctx: ExecutionContext): UserClaims | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested, return just that property
    if (data) {
      return user?.[data];
    }

    // Otherwise return the full user claims object
    return user;
  },
);
