import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@test.com',
    password: 'hashedPassword',
    role: 'USER',
    tenantId: 'tenant-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTenant = {
    id: 'tenant-id',
    name: 'Test Tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      tenant: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockJwt = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser('test@test.com', 'password');

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', mockUser.password);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('test@test.com', 'password');

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser('test@test.com', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });
  });

  describe('login', () => {
    it('should return access token and user data when credentials are valid', async () => {
      // Arrange
      const loginDto = { email: 'test@test.com', password: 'password' };
      const mockToken = 'mock-jwt-token';
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          tenantId: mockUser.tenantId,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      const loginDto = { email: 'test@test.com', password: 'wrongpassword' };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create new user and tenant when email is not taken', async () => {
      // Arrange
      const registerDto = { email: 'new@test.com', password: 'SecurePass123' };
      const hashedPassword = 'hashedSecurePass123';
      const mockToken = 'mock-jwt-token';
      
      const newUser = {
        ...mockUser,
        id: 'new-user-id',
        email: registerDto.email,
        password: hashedPassword,
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          tenant: { create: jest.fn().mockResolvedValue(mockTenant) },
          user: { create: jest.fn().mockResolvedValue(newUser) },
        });
      });
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          tenantId: newUser.tenantId,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw ConflictException when email is already taken', async () => {
      // Arrange
      const registerDto = { email: 'existing@test.com', password: 'SecurePass123' };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });
});
