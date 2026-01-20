import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * InsufficientPermissionsException
 * 
 * Thrown when a user does not have the required roles to access an endpoint.
 * Returns 403 Forbidden with INSUFFICIENT_PERMISSIONS error code.
 */
export class InsufficientPermissionsException extends HttpException {
  constructor(message: string = 'Insufficient permissions to access this resource') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'INSUFFICIENT_PERMISSIONS',
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
