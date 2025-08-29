import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Suppliers (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authCookie: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
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
    await prismaService.supplier.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.tenant.deleteMany();

    // Register and login a test user
    const userCredentials = {
      email: 'test@test.com',
      password: 'TestPass123',
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userCredentials);

    authCookie = loginResponse.headers['set-cookie']
      .find((cookie: string) => cookie.includes('access_token'));

    tenantId = loginResponse.body.user.tenantId;
  });

  describe('/suppliers (GET)', () => {
    it('should return empty array when no suppliers exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/suppliers')
        .expect(401);
    });

    it('should return suppliers for authenticated user', async () => {
      // Create a test supplier
      const supplierData = {
        name: 'Test Supplier',
        category: 'Technology',
        location: 'New York',
        contact: 'John Doe',
        phone: '123-456-7890',
        website: 'https://test.com',
        notes: 'Test notes',
      };

      await prismaService.supplier.create({
        data: { ...supplierData, tenantId },
      });

      const response = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(supplierData);
    });

    it('should filter suppliers by search term', async () => {
      // Create test suppliers
      await prismaService.supplier.createMany({
        data: [
          {
            name: 'Tech Corp',
            category: 'Technology',
            location: 'New York',
            tenantId,
          },
          {
            name: 'Manufacturing Inc',
            category: 'Manufacturing',
            location: 'California',
            tenantId,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/suppliers?search=tech')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Tech Corp');
    });
  });

  describe('/suppliers (POST)', () => {
    it('should create a new supplier', async () => {
      const supplierData = {
        name: 'New Supplier',
        category: 'Technology',
        location: 'San Francisco',
        contact: 'Jane Smith',
        phone: '098-765-4321',
        website: 'https://newsupplier.com',
        notes: 'New supplier notes',
      };

      const response = await request(app.getHttpServer())
        .post('/suppliers')
        .set('Cookie', authCookie)
        .send(supplierData)
        .expect(201);

      expect(response.body).toMatchObject(supplierData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('tenantId', tenantId);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should require authentication', async () => {
      const supplierData = {
        name: 'Test Supplier',
        category: 'Technology',
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .send(supplierData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        category: 'Technology',
        // Missing required 'name' field
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .set('Cookie', authCookie)
        .send(invalidData)
        .expect(400);
    });

    it('should reject extra fields', async () => {
      const dataWithExtraFields = {
        name: 'Test Supplier',
        category: 'Technology',
        extraField: 'should be rejected',
      };

      await request(app.getHttpServer())
        .post('/suppliers')
        .set('Cookie', authCookie)
        .send(dataWithExtraFields)
        .expect(400);
    });
  });

  describe('/suppliers/:id (GET)', () => {
    let supplierId: string;

    beforeEach(async () => {
      const supplier = await prismaService.supplier.create({
        data: {
          name: 'Test Supplier',
          category: 'Technology',
          tenantId,
        },
      });
      supplierId = supplier.id;
    });

    it('should return supplier by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveProperty('id', supplierId);
      expect(response.body).toHaveProperty('name', 'Test Supplier');
    });

    it('should return 404 for non-existent supplier', async () => {
      const nonExistentId = 'non-existent-id';

      await request(app.getHttpServer())
        .get(`/suppliers/${nonExistentId}`)
        .set('Cookie', authCookie)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .expect(401);
    });
  });

  describe('/suppliers/:id (PUT)', () => {
    let supplierId: string;

    beforeEach(async () => {
      const supplier = await prismaService.supplier.create({
        data: {
          name: 'Original Supplier',
          category: 'Technology',
          tenantId,
        },
      });
      supplierId = supplier.id;
    });

    it('should update supplier', async () => {
      const updateData = {
        name: 'Updated Supplier',
        category: 'Manufacturing',
      };

      const response = await request(app.getHttpServer())
        .put(`/suppliers/${supplierId}`)
        .set('Cookie', authCookie)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Supplier');
      expect(response.body).toHaveProperty('category', 'Manufacturing');
    });

    it('should return 404 for non-existent supplier', async () => {
      const nonExistentId = 'non-existent-id';
      const updateData = { name: 'Updated Name' };

      await request(app.getHttpServer())
        .put(`/suppliers/${nonExistentId}`)
        .set('Cookie', authCookie)
        .send(updateData)
        .expect(404);
    });

    it('should require authentication', async () => {
      const updateData = { name: 'Updated Name' };

      await request(app.getHttpServer())
        .put(`/suppliers/${supplierId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('/suppliers/:id (DELETE)', () => {
    let supplierId: string;

    beforeEach(async () => {
      const supplier = await prismaService.supplier.create({
        data: {
          name: 'Supplier to Delete',
          category: 'Technology',
          tenantId,
        },
      });
      supplierId = supplier.id;
    });

    it('should delete supplier', async () => {
      await request(app.getHttpServer())
        .delete(`/suppliers/${supplierId}`)
        .set('Cookie', authCookie)
        .expect(200);

      // Verify supplier is deleted
      const deletedSupplier = await prismaService.supplier.findUnique({
        where: { id: supplierId },
      });
      expect(deletedSupplier).toBeNull();
    });

    it('should return 404 for non-existent supplier', async () => {
      const nonExistentId = 'non-existent-id';

      await request(app.getHttpServer())
        .delete(`/suppliers/${nonExistentId}`)
        .set('Cookie', authCookie)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/suppliers/${supplierId}`)
        .expect(401);
    });
  });
});
