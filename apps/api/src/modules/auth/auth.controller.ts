import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    // Set HTTP-only cookie
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return { user: result.user };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    
    // Set HTTP-only cookie
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return { user: result.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
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
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return;
  }
}
