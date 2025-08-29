import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityConfig {
  // JWT Configuration
  static readonly JWT_EXPIRY = '24h';
  static readonly JWT_REFRESH_EXPIRY = '7d';

  // Cookie Configuration
  static readonly COOKIE_NAME = 'access_token';
  static readonly COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  // Rate Limiting
  static readonly RATE_LIMITS = {
    DEFAULT: { limit: 100, ttl: 60000 }, // 100 requests per minute
    AUTH: { limit: 5, ttl: 60000 }, // 5 auth requests per minute
    UPLOAD: { limit: 10, ttl: 60000 }, // 10 uploads per minute
    API_WRITE: { limit: 30, ttl: 60000 }, // 30 write operations per minute
  };

  // File Upload Restrictions
  static readonly FILE_UPLOAD = {
    MAX_SIZE: 25 * 1024 * 1024, // 25MB
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  };

  // Password Policy
  static readonly PASSWORD_POLICY = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
    MAX_AGE_DAYS: 90, // Optional: password rotation reminder
  };

  // Session Security
  static readonly SESSION = {
    MAX_CONCURRENT_SESSIONS: 3,
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  };

  // Security Headers
  static readonly SECURITY_HEADERS = {
    HSTS_MAX_AGE: 31536000, // 1 year
    CSP_POLICY: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  };

  // Audit and Monitoring
  static readonly AUDIT = {
    LOG_FAILED_LOGINS: true,
    LOG_ADMIN_ACTIONS: true,
    LOG_DATA_ACCESS: true,
    RETENTION_DAYS: 90,
  };

  // IP Allow/Block Lists (for future use)
  static readonly IP_RESTRICTIONS = {
    ENABLE_IP_WHITELIST: false,
    ALLOWED_IPS: [] as string[],
    BLOCKED_IPS: [] as string[],
  };

  // Get secure cookie options
  static getCookieOptions(isProduction: boolean = false) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('strict' as const) : ('lax' as const),
      maxAge: this.COOKIE_MAX_AGE,
      domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
    };
  }

  // Get CORS origins
  static getCorsOrigins(): string[] {
    const webOrigin = process.env.WEB_ORIGIN;
    if (!webOrigin) {
      return ['http://localhost:5173'];
    }
    return webOrigin.split(',').map((origin) => origin.trim());
  }

  // Validate password against policy
  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < this.PASSWORD_POLICY.MIN_LENGTH) {
      errors.push(
        `Password must be at least ${this.PASSWORD_POLICY.MIN_LENGTH} characters long`
      );
    }

    if (this.PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.PASSWORD_POLICY.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (
      this.PASSWORD_POLICY.REQUIRE_SYMBOLS &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('Password must contain at least one symbol');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Check if password rotation is needed
  static isPasswordRotationNeeded(passwordLastChanged: Date): boolean {
    if (!this.PASSWORD_POLICY.MAX_AGE_DAYS) return false;

    const maxAgeMs = this.PASSWORD_POLICY.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const ageMs = Date.now() - passwordLastChanged.getTime();

    return ageMs > maxAgeMs;
  }
}
