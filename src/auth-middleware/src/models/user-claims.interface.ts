/**
 * UserClaims Interface
 * 
 * Represents the decoded JWT payload containing user identity and authorization information.
 * This interface is attached to the request object by AuthGuard and accessible via @User() decorator.
 */
export interface UserClaims {
  /**
   * Subject - User's unique identifier
   * Corresponds to JWT 'sub' claim
   * @example "user-123-abc"
   */
  sub: string;

  /**
   * User's email address
   * @example "user@example.com"
   */
  email: string;

  /**
   * Array of role identifiers assigned to the user
   * Case-sensitive role names (e.g., "admin", "user", "moderator")
   * Defaults to empty array if missing from token
   * @example ["admin", "moderator"]
   */
  roles: string[];

  /**
   * Token expiration time (Unix timestamp in seconds)
   * Optional - may be absent in some tokens
   * @example 1735689600 (represents 2024-12-31 12:00:00 UTC)
   */
  exp?: number;

  /**
   * Token issued-at time (Unix timestamp in seconds)
   * Optional - may be absent in some tokens
   * @example 1735603200
   */
  iat?: number;
}
