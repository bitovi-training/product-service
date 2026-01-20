import { Test, TestingModule } from '@nestjs/testing';
import { JwtParserService } from '../../src/services/jwt-parser.service';
import { InvalidTokenException } from '../../src/exceptions/invalid-token.exception';

describe('JwtParserService - Basic Validation', () => {
  let service: JwtParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtParserService],
    }).compile();

    service = module.get<JwtParserService>(JwtParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse a valid JWT token', () => {
    // Create a simple JWT token: header.payload.signature
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-123',
      email: 'test@example.com',
      roles: ['admin', 'user'],
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    })).toString('base64url');
    const signature = 'mock-signature';

    const token = `${header}.${payload}.${signature}`;
    const claims = service.parseToken(token);

    expect(claims.sub).toBe('user-123');
    expect(claims.email).toBe('test@example.com');
    expect(claims.roles).toEqual(['admin', 'user']);
    expect(claims.exp).toBeDefined();
    expect(claims.iat).toBeDefined();
  });

  it('should reject token with missing sub claim', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      email: 'test@example.com',
      roles: ['user'],
    })).toString('base64url');
    const signature = 'mock-signature';

    const token = `${header}.${payload}.${signature}`;

    expect(() => service.parseToken(token)).toThrow(InvalidTokenException);
  });

  it('should reject token with missing email claim', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-123',
      roles: ['user'],
    })).toString('base64url');
    const signature = 'mock-signature';

    const token = `${header}.${payload}.${signature}`;

    expect(() => service.parseToken(token)).toThrow(InvalidTokenException);
  });

  it('should default roles to empty array when missing', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-123',
      email: 'test@example.com',
    })).toString('base64url');
    const signature = 'mock-signature';

    const token = `${header}.${payload}.${signature}`;
    const claims = service.parseToken(token);

    expect(claims.roles).toEqual([]);
  });

  it('should reject malformed token (not 3 parts)', () => {
    const token = 'invalid.token';
    expect(() => service.parseToken(token)).toThrow(InvalidTokenException);
  });

  it('should accept expired tokens with warning', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-123',
      email: 'test@example.com',
      roles: ['user'],
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    })).toString('base64url');
    const signature = 'mock-signature';

    const token = `${header}.${payload}.${signature}`;
    const claims = service.parseToken(token);

    // Should not throw, just log warning
    expect(claims.sub).toBe('user-123');
  });
});
