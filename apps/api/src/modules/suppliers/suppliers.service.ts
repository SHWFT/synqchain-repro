import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    const where: any = { tenantId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async create(createSupplierDto: CreateSupplierDto, tenantId: string) {
    return this.prisma.supplier.create({
      data: {
        ...createSupplierDto,
        tenantId,
      },
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, tenantId: string) {
    // Check if supplier exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string, tenantId: string) {
    // Check if supplier exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
