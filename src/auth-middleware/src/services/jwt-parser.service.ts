import { Injectable, Logger } from '@nestjs/common';
import { UserClaims } from '../models/user-claims.interface';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';

/**
 * JwtParserService
 * 
 * Parses JWT tokens to extract user claims without signature verification.
 * This is a MOCK implementation for development/testing purposes only.
 * 
 * ⚠️ WARNING: Does not verify cryptographic signatures. DO NOT use in production.
 */
@Injectable()
export class JwtParserService {
  private readonly logger = new Logger(JwtParserService.name);

  /**
   * Parse a JWT token and extract user claims
   * 
   * @param token - JWT token string (header.payload.signature)
   * @returns UserClaims object with user identity and roles
   * @throws InvalidTokenException if token is malformed or missing required claims
   */
  parseToken(token: string): UserClaims {
    // FR-001: Validate token has exactly 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      this.logger.warn('Token validation failed: invalid format (expected 3 parts)', {
        partsCount: parts.length,
      });
      throw new InvalidTokenException('JWT token must have exactly 3 parts separated by dots');
    }

    // FR-002: Decode base64url-encoded payload (middle part)
    const payload = parts[1];
    let decodedPayload: string;
    
    try {
      // Base64url decoding: replace URL-safe characters and add padding if needed
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      decodedPayload = Buffer.from(padded, 'base64').toString('utf-8');
    } catch (error) {
      this.logger.warn('Token validation failed: invalid base64 encoding', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new InvalidTokenException('JWT payload is not valid base64url encoding');
    }

    // Parse JSON payload
    let parsedClaims: unknown;
    try {
      parsedClaims = JSON.parse(decodedPayload);
    } catch (error) {
      this.logger.warn('Token validation failed: invalid JSON payload', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new InvalidTokenException('JWT payload is not valid JSON');
    }

    // Type guard - ensure claims is an object
    if (!parsedClaims || typeof parsedClaims !== 'object') {
      this.logger.warn('Token validation failed: payload is not an object');
      throw new InvalidTokenException('JWT payload must be an object');
    }

    const claims = parsedClaims as Record<string, unknown>;

    // FR-003: Validate required claims (sub, email)
    if (!claims.sub || typeof claims.sub !== 'string' || claims.sub.trim() === '') {
      this.logger.warn('Token validation failed: missing or invalid "sub" claim');
      throw new InvalidTokenException('JWT token must contain a valid "sub" claim');
    }

    if (!claims.email || typeof claims.email !== 'string' || claims.email.trim() === '') {
      this.logger.warn('Token validation failed: missing or invalid "email" claim');
      throw new InvalidTokenException('JWT token must contain a valid "email" claim');
    }

    // FR-014: Handle missing or invalid roles claim (default to empty array)
    let roles: string[] = [];
    if (claims.roles !== undefined) {
      if (Array.isArray(claims.roles)) {
        // Validate all elements are strings
        if (claims.roles.every((r: unknown) => typeof r === 'string')) {
          roles = claims.roles;
        } else {
          this.logger.warn('Token contains invalid roles claim (non-string elements), defaulting to empty array', {
            rolesType: typeof claims.roles,
          });
        }
      } else {
        this.logger.warn('Token contains invalid roles claim (not an array), defaulting to empty array', {
          rolesType: typeof claims.roles,
        });
      }
    }

    // FR-013: Check token expiration but accept expired tokens with warning
    if (claims.exp !== undefined) {
      const now = Math.floor(Date.now() / 1000);
      if (typeof claims.exp === 'number' && claims.exp < now) {
        const expiredDate = new Date(claims.exp * 1000).toISOString();
        this.logger.warn('Token is expired but accepted in mock mode', {
          exp: claims.exp,
          expiredDate,
          currentTime: now,
        });
      }
    }

    const userClaims: UserClaims = {
      sub: claims.sub as string,
      email: claims.email as string,
      roles,
      exp: typeof claims.exp === 'number' ? claims.exp : undefined,
      iat: typeof claims.iat === 'number' ? claims.iat : undefined,
    };

    this.logger.debug('Token parsed successfully', {
      sub: userClaims.sub,
      rolesCount: userClaims.roles.length,
      hasExpiration: !!userClaims.exp,
    });

    return userClaims;
  }
}
