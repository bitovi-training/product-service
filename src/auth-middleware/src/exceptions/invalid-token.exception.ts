import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * InvalidTokenException
 * 
 * Thrown when a JWT token is missing, malformed, or cannot be parsed.
 * Returns 401 Unauthorized with INVALID_TOKEN error code.
 */
export class InvalidTokenException extends HttpException {
  constructor(message: string = 'Invalid or malformed JWT token') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'INVALID_TOKEN',
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
