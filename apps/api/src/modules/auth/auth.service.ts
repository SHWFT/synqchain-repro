import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      tenantId: user.tenantId,
      role: user.role 
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // For development, create a default tenant if none exists
    let tenant = await this.prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: 'Default Company',
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        tenantId: tenant.id,
      },
      include: { tenant: true },
    });

    const payload = { 
      email: user.email, 
      sub: user.id, 
      tenantId: user.tenantId,
      role: user.role 
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
