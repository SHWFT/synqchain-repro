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

    // Create initial event with full context
    await this.createPOEvent(po.id, 'created', {
      message: 'Purchase Order created',
      previousStatus: null,
      newStatus: po.status,
      changes: createPoDto,
    }, userEmail);

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

    // Create update event with change tracking
    await this.createPOEvent(po.id, 'updated', {
      message: 'Purchase Order updated',
      previousStatus: existingPo.status,
      newStatus: po.status,
      changes: updatePoDto,
    }, userEmail);

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
    await this.createPOEvent(po.id, 'submitted', {
      message: 'Purchase Order submitted for approval',
      previousStatus: POStatus.DRAFT,
      newStatus: POStatus.PENDING_APPROVAL,
      notes: submitPoDto.notes,
    }, userEmail);

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
    await this.createPOEvent(po.id, 'approved', {
      message: 'Purchase Order approved',
      previousStatus: POStatus.PENDING_APPROVAL,
      newStatus: POStatus.APPROVED,
      notes: approvePoDto.notes,
    }, userEmail);

    return updatedPo;
  }

  async getEvents(id: string, tenantId: string, page: number = 1, limit: number = 20) {
    // Check if PO exists and belongs to tenant
    await this.findOne(id, tenantId);

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.pOEvent.findMany({
        where: { poId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pOEvent.count({
        where: { poId: id },
      }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async remove(id: string, tenantId: string) {
    // Check if PO exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }

  private async createPOEvent(
    poId: string,
    type: string,
    payload: any,
    actorEmail: string,
  ) {
    return this.prisma.pOEvent.create({
      data: {
        poId,
        type,
        payload: {
          ...payload,
          actorEmail,
          timestamp: new Date().toISOString(),
          userAgent: 'SynqChain Web App', // Could be passed from request
        },
      },
    });
  }
}
