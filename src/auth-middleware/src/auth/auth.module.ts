import { Module } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RequireRolesGuard } from '../guards/require-roles.guard';
import { RequireAllRolesGuard } from '../guards/require-all-roles.guard';
import { JwtParserService } from '../services/jwt-parser.service';
import { UserClaimsService } from '../services/user-claims.service';

/**
 * AuthModule
 * 
 * Provides authentication and authorization services for NestJS applications.
 * Exports AuthGuard, RequireRolesGuard, RequireAllRolesGuard, and related services for use in other modules.
 * 
 * @example
 * ```typescript
 * @Module({
 *   imports: [AuthModule],
 *   controllers: [ApiController],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  providers: [JwtParserService, UserClaimsService, AuthGuard, RequireRolesGuard, RequireAllRolesGuard],
  exports: [AuthGuard, RequireRolesGuard, RequireAllRolesGuard, JwtParserService, UserClaimsService],
})
export class AuthModule {}
