import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    // Set secure HTTP-only cookie
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    });

    return { user: result.user };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    
    // Set secure HTTP-only cookie
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    });

    return { user: result.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const user = await this.authService.prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { tenant: true },
      select: {
        id: true,
        email: true,
        role: true,
        tenant: true,
        createdAt: true,
      },
    });

    return { user };
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return;
  }
}
