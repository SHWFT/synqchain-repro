import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePoDto, UpdatePoDto, SubmitPoDto, ApprovePoDto } from './dto/po.dto';
import { POStatus } from '@prisma/client';

@Injectable()
export class PoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    const where: any = { tenantId };
    
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: { 
        supplier: true,
        events: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase Order not found');
    }

    return po;
  }

  async create(createPoDto: CreatePoDto, tenantId: string, userEmail: string) {
    // Check if PO number already exists
    const existingPo = await this.prisma.purchaseOrder.findUnique({
      where: { number: createPoDto.number },
    });

    if (existingPo) {
      throw new BadRequestException('PO number already exists');
    }

    const po = await this.prisma.purchaseOrder.create({
      data: {
        ...createPoDto,
        tenantId,
      },
      include: { supplier: true },
    });

    // Create initial event
    await this.prisma.pOEvent.create({
      data: {
        poId: po.id,
        type: 'created',
        payload: {
          message: 'Purchase Order created',
          user: userEmail,
          timestamp: new Date(),
        },
      },
    });

    return po;
  }

  async update(id: string, updatePoDto: UpdatePoDto, tenantId: string, userEmail: string) {
    // Check if PO exists and belongs to tenant
    const existingPo = await this.findOne(id, tenantId);

    // If updating PO number, check for uniqueness
    if (updatePoDto.number && updatePoDto.number !== existingPo.number) {
      const duplicatePo = await this.prisma.purchaseOrder.findUnique({
        where: { number: updatePoDto.number },
      });

      if (duplicatePo) {
        throw new BadRequestException('PO number already exists');
      }
    }

    const po = await this.prisma.purchaseOrder.update({
      where: { id },
      data: updatePoDto,
      include: { supplier: true },
    });

    // Create update event
    await this.prisma.pOEvent.create({
      data: {
        poId: po.id,
        type: 'updated',
        payload: {
          message: 'Purchase Order updated',
          user: userEmail,
          timestamp: new Date(),
          changes: updatePoDto,
        },
      },
    });

    return po;
  }

  async submit(id: string, submitPoDto: SubmitPoDto, tenantId: string, userEmail: string) {
    const po = await this.findOne(id, tenantId);

    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestException('Only draft POs can be submitted');
    }

    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.PENDING_APPROVAL },
      include: { supplier: true },
    });

    // Create submission event
    await this.prisma.pOEvent.create({
      data: {
        poId: po.id,
        type: 'submitted',
        payload: {
          message: 'Purchase Order submitted for approval',
          user: userEmail,
          timestamp: new Date(),
          notes: submitPoDto.notes,
        },
      },
    });

    return updatedPo;
  }

  async approve(id: string, approvePoDto: ApprovePoDto, tenantId: string, userEmail: string) {
    const po = await this.findOne(id, tenantId);

    if (po.status !== POStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending POs can be approved');
    }

    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.APPROVED },
      include: { supplier: true },
    });

    // Create approval event
    await this.prisma.pOEvent.create({
      data: {
        poId: po.id,
        type: 'approved',
        payload: {
          message: 'Purchase Order approved',
          user: userEmail,
          timestamp: new Date(),
          notes: approvePoDto.notes,
        },
      },
    });

    return updatedPo;
  }

  async getEvents(id: string, tenantId: string) {
    // Check if PO exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.pOEvent.findMany({
      where: { poId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, tenantId: string) {
    // Check if PO exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }
}
