import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(
    file: Express.Multer.File,
    entityType: string,
    entityId: string,
    tenantId: string
  ) {
    // Validate entity type
    if (!['po', 'project', 'supplier'].includes(entityType)) {
      throw new BadRequestException('Invalid entity type');
    }

    // Validate that entity exists
    await this.validateEntity(entityType, entityId, tenantId);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const timestamp = Date.now();
    const uniqueFilename = `${entityType}_${entityId}_${timestamp}${fileExtension}`;
    
    // Define storage path
    const basePath = process.env.FILES_BASE_PATH || './data/files';
    const storageKey = path.join(basePath, uniqueFilename);

    // Ensure directory exists
    const dir = path.dirname(storageKey);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file to disk
    fs.writeFileSync(storageKey, file.buffer);

    // Save file metadata to database
    const fileRecord = await this.prisma.file.create({
      data: {
        tenantId,
        entityType,
        entityId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey,
      },
    });

    return {
      id: fileRecord.id,
      filename: fileRecord.filename,
      url: `/files/${fileRecord.id}`,
      size: fileRecord.size,
      mimeType: fileRecord.mimeType,
    };
  }

  async getFile(id: string, tenantId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id, tenantId },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.storageKey)) {
      throw new BadRequestException('File not found on disk');
    }

    return {
      file,
      buffer: fs.readFileSync(file.storageKey),
    };
  }

  async getFilesByEntity(entityType: string, entityId: string, tenantId: string) {
    return this.prisma.file.findMany({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    });
  }

  async deleteFile(id: string, tenantId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id, tenantId },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    // Delete from disk
    if (fs.existsSync(file.storageKey)) {
      fs.unlinkSync(file.storageKey);
    }

    // Delete from database
    await this.prisma.file.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }

  private async validateEntity(entityType: string, entityId: string, tenantId: string) {
    let exists = false;

    switch (entityType) {
      case 'po':
        exists = !!(await this.prisma.purchaseOrder.findFirst({
          where: { id: entityId, tenantId },
        }));
        break;
      case 'project':
        exists = !!(await this.prisma.project.findFirst({
          where: { id: entityId, tenantId },
        }));
        break;
      case 'supplier':
        exists = !!(await this.prisma.supplier.findFirst({
          where: { id: entityId, tenantId },
        }));
        break;
    }

    if (!exists) {
      throw new BadRequestException(`${entityType} not found`);
    }
  }
}
