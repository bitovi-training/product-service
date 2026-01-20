/**
 * AuthError Interface
 * 
 * Defines the structure of error responses returned by the authentication middleware.
 * All auth-related exceptions should follow this format for consistent error handling.
 */
export interface AuthError {
  /**
   * HTTP status code
   * @example 401, 403
   */
  statusCode: number;

  /**
   * Machine-readable error code
   * @example "INVALID_TOKEN", "INSUFFICIENT_PERMISSIONS"
   */
  error: string;

  /**
   * Human-readable error message
   * @example "Invalid or malformed JWT token"
   */
  message: string;
}
