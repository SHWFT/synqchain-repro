import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockSupplier = {
    id: 'supplier-id',
    tenantId: 'tenant-id',
    name: 'Test Supplier',
    category: 'Technology',
    location: 'New York',
    contact: 'John Doe',
    phone: '123-456-7890',
    website: 'https://test-supplier.com',
    notes: 'Test supplier notes',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateSupplierDto = {
    name: 'New Supplier',
    category: 'Manufacturing',
    location: 'California',
    contact: 'Jane Smith',
    phone: '098-765-4321',
    website: 'https://new-supplier.com',
    notes: 'New supplier notes',
  };

  beforeEach(async () => {
    const mockPrisma = {
      supplier: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all suppliers for a tenant', async () => {
      // Arrange
      const tenantId = 'tenant-id';
      const suppliers = [mockSupplier];
      
      prismaService.supplier.findMany.mockResolvedValue(suppliers);

      // Act
      const result = await service.findAll(tenantId);

      // Assert
      expect(result).toEqual(suppliers);
      expect(prismaService.supplier.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter suppliers by search term', async () => {
      // Arrange
      const tenantId = 'tenant-id';
      const search = 'test';
      const suppliers = [mockSupplier];
      
      prismaService.supplier.findMany.mockResolvedValue(suppliers);

      // Act
      const result = await service.findAll(tenantId, search);

      // Assert
      expect(result).toEqual(suppliers);
      expect(prismaService.supplier.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      // Arrange
      const id = 'supplier-id';
      const tenantId = 'tenant-id';
      
      prismaService.supplier.findUnique.mockResolvedValue(mockSupplier);

      // Act
      const result = await service.findOne(id, tenantId);

      // Assert
      expect(result).toEqual(mockSupplier);
      expect(prismaService.supplier.findUnique).toHaveBeenCalledWith({
        where: { id, tenantId },
      });
    });

    it('should throw NotFoundException when supplier does not exist', async () => {
      // Arrange
      const id = 'nonexistent-id';
      const tenantId = 'tenant-id';
      
      prismaService.supplier.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id, tenantId)).rejects.toThrow(NotFoundException);
      expect(prismaService.supplier.findUnique).toHaveBeenCalledWith({
        where: { id, tenantId },
      });
    });
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      // Arrange
      const tenantId = 'tenant-id';
      const newSupplier = { ...mockSupplier, ...mockCreateSupplierDto };
      
      prismaService.supplier.create.mockResolvedValue(newSupplier);

      // Act
      const result = await service.create(mockCreateSupplierDto, tenantId);

      // Assert
      expect(result).toEqual(newSupplier);
      expect(prismaService.supplier.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateSupplierDto,
          tenantId,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing supplier', async () => {
      // Arrange
      const id = 'supplier-id';
      const tenantId = 'tenant-id';
      const updateData = { name: 'Updated Supplier Name' };
      const updatedSupplier = { ...mockSupplier, ...updateData };

      // First check if supplier exists
      prismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      // Then update it
      prismaService.supplier.update.mockResolvedValue(updatedSupplier);

      // Act
      const result = await service.update(id, updateData, tenantId);

      // Assert
      expect(result).toEqual(updatedSupplier);
      expect(prismaService.supplier.findUnique).toHaveBeenCalledWith({
        where: { id, tenantId },
      });
      expect(prismaService.supplier.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });

    it('should throw NotFoundException when updating non-existent supplier', async () => {
      // Arrange
      const id = 'nonexistent-id';
      const tenantId = 'tenant-id';
      const updateData = { name: 'Updated Name' };

      prismaService.supplier.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateData, tenantId)).rejects.toThrow(NotFoundException);
      expect(prismaService.supplier.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an existing supplier', async () => {
      // Arrange
      const id = 'supplier-id';
      const tenantId = 'tenant-id';

      // First check if supplier exists
      prismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      // Then delete it
      prismaService.supplier.delete.mockResolvedValue(mockSupplier);

      // Act
      const result = await service.remove(id, tenantId);

      // Assert
      expect(result).toEqual(mockSupplier);
      expect(prismaService.supplier.findUnique).toHaveBeenCalledWith({
        where: { id, tenantId },
      });
      expect(prismaService.supplier.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException when deleting non-existent supplier', async () => {
      // Arrange
      const id = 'nonexistent-id';
      const tenantId = 'tenant-id';

      prismaService.supplier.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(id, tenantId)).rejects.toThrow(NotFoundException);
      expect(prismaService.supplier.delete).not.toHaveBeenCalled();
    });
  });
});
