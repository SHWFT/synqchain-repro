import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    const request = context.switchToHttp().getRequest();
    
    // Try to get token from cookie
    const token = request.cookies?.access_token;
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
