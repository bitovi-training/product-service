import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtParserService } from '../services/jwt-parser.service';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';
import { UserClaims } from '../models/user-claims.interface';

/**
 * AuthGuard
 * 
 * NestJS guard that validates JWT tokens and attaches user claims to the request.
 * Extracts Bearer token from Authorization header, parses it, and makes user information
 * available to downstream handlers via request.user.
 * 
 * Usage:
 * ```typescript
 * @Controller('api')
 * @UseGuards(AuthGuard)
 * export class ApiController {
 *   @Get('profile')
 *   getProfile(@User() user: UserClaims) {
 *     return user;
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtParser: JwtParserService) {}

  /**
   * Validates the request by checking for a valid JWT token
   * 
   * @param context - Execution context containing request information
   * @returns true if authentication succeeds, throws exception otherwise
   * @throws InvalidTokenException if token is missing or invalid
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // FR-006: Extract token from Authorization header
    const authHeader = request.headers?.authorization;
    
    if (!authHeader) {
      this.logger.warn('Authentication failed: missing Authorization header', {
        path: request.url,
        method: request.method,
      });
      throw new InvalidTokenException('Missing Authorization header');
    }

    // Extract Bearer token
    const bearerPrefix = 'Bearer ';
    if (!authHeader.startsWith(bearerPrefix)) {
      this.logger.warn('Authentication failed: invalid Authorization header format', {
        path: request.url,
        format: authHeader.substring(0, 20),
      });
      throw new InvalidTokenException('Authorization header must use Bearer scheme');
    }

    const token = authHeader.substring(bearerPrefix.length).trim();
    
    if (!token) {
      this.logger.warn('Authentication failed: empty token', {
        path: request.url,
      });
      throw new InvalidTokenException('Bearer token is empty');
    }

    // FR-004: Parse token and extract user claims
    let userClaims: UserClaims;
    try {
      userClaims = this.jwtParser.parseToken(token);
    } catch (error) {
      // JwtParserService already logs the specific error, just re-throw
      this.logger.warn('Authentication failed: token parsing error', {
        path: request.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }

    // FR-004: Attach user claims to request
    request.user = userClaims;

    // Log successful authentication
    this.logger.log('Authentication successful', {
      userId: userClaims.sub,
      email: userClaims.email,
      rolesCount: userClaims.roles.length,
      path: request.url,
      method: request.method,
    });

    return true;
  }
}
