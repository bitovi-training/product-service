import { Controller, Get, Delete, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  RequireRolesGuard,
  RequireAllRolesGuard,
  Roles,
  RequireAllRoles,
  User,
  UserClaims,
} from '../../src/index';

/**
 * Example API Controller
 * 
 * Demonstrates the usage of authentication and authorization guards
 */
@Controller('api')
export class ExampleController {
  /**
   * Public endpoint - no authentication required
   */
  @Get('public')
  getPublic() {
    return { message: 'This endpoint is public' };
  }

  /**
   * Protected endpoint - requires valid JWT token
   */
  @Get('protected')
  @UseGuards(AuthGuard)
  getProtected(@User() user: UserClaims) {
    return {
      message: 'You are authenticated',
      user: {
        id: user.sub,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  /**
   * Admin or Moderator only - requires ANY ONE of the specified roles
   */
  @Get('admin/dashboard')
  @UseGuards(AuthGuard, RequireRolesGuard)
  @Roles('admin', 'moderator')
  getAdminDashboard(@User() user: UserClaims) {
    return {
      message: 'Admin dashboard',
      userId: user.sub,
      roles: user.roles,
    };
  }

  /**
   * Super admin only - requires ALL specified roles
   */
  @Delete('admin/critical')
  @UseGuards(AuthGuard, RequireAllRolesGuard)
  @RequireAllRoles('admin', 'superuser')
  criticalOperation(@User() user: UserClaims) {
    return {
      message: 'Critical operation executed',
      executedBy: user.sub,
    };
  }

  /**
   * Access specific claim using @User('property') syntax
   */
  @Get('profile/email')
  @UseGuards(AuthGuard)
  getEmail(@User('email') email: string) {
    return { email };
  }

  /**
   * Access user roles
   */
  @Get('profile/roles')
  @UseGuards(AuthGuard)
  getRoles(@User('roles') roles: string[]) {
    return { roles };
  }
}
