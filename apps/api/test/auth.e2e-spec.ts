import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Setup global pipes like in main.ts
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    prismaService = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prismaService.user.deleteMany();
    await prismaService.tenant.deleteMany();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'TestPass123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', registerDto.email);
      expect(response.body.user).toHaveProperty('role', 'ADMIN'); // First user is admin
      expect(response.body.user).toHaveProperty('tenantId');

      // Should set HTTP-only cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies.some((cookie: string) => cookie.includes('access_token'))).toBe(true);
    });

    it('should reject registration with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'TestPass123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'weak',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject duplicate email registration', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'TestPass123',
      };

      // First registration should succeed
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration with same email should fail
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    const userCredentials = {
      email: 'test@test.com',
      password: 'TestPass123',
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userCredentials)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userCredentials.email);

      // Should set HTTP-only cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies.some((cookie: string) => cookie.includes('access_token'))).toBe(true);
    });

    it('should reject login with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@test.com',
          password: userCredentials.password,
        })
        .expect(401);
    });

    it('should reject login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with malformed request', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'not-an-email',
          password: 123, // Should be string
        })
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    const userCredentials = {
      email: 'test@test.com',
      password: 'TestPass123',
    };

    let authCookie: string;

    beforeEach(async () => {
      // Register and login to get auth cookie
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCredentials);

      authCookie = loginResponse.headers['set-cookie']
        .find((cookie: string) => cookie.includes('access_token'));
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userCredentials.email);
      expect(response.body.user).toHaveProperty('role');
      expect(response.body.user).toHaveProperty('tenant');
    });

    it('should reject request without auth cookie', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', 'access_token=invalid-token')
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout and clear cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(204);

      // Should clear the cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies.some((cookie: string) => 
        cookie.includes('access_token=') && cookie.includes('Max-Age=0')
      )).toBe(true);
    });
  });
});
