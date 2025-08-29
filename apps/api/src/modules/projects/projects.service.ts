import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    const where: any = { tenantId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto, tenantId: string) {
    const data: any = {
      ...createProjectDto,
      tenantId,
    };

    // Convert date strings to Date objects
    if (createProjectDto.startDate) {
      data.startDate = new Date(createProjectDto.startDate);
    }
    if (createProjectDto.dueDate) {
      data.dueDate = new Date(createProjectDto.dueDate);
    }

    return this.prisma.project.create({ data });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, tenantId: string) {
    // Check if project exists and belongs to tenant
    await this.findOne(id, tenantId);

    const data: any = { ...updateProjectDto };

    // Convert date strings to Date objects
    if (updateProjectDto.startDate) {
      data.startDate = new Date(updateProjectDto.startDate);
    }
    if (updateProjectDto.dueDate) {
      data.dueDate = new Date(updateProjectDto.dueDate);
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    // Check if project exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
