import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ upload: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Req() req: Request
  ) {
    return this.filesService.uploadFile(
      file,
      entityType,
      entityId,
      req.user.tenantId
    );
  }

  @Get(':id')
  async downloadFile(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { file, buffer } = await this.filesService.getFile(
      id,
      req.user.tenantId
    );

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.size.toString(),
    });

    res.send(buffer);
  }

  @Get('entity/:entityType/:entityId')
  async getFilesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Req() req: Request
  ) {
    return this.filesService.getFilesByEntity(
      entityType,
      entityId,
      req.user.tenantId
    );
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Req() req: Request) {
    return this.filesService.deleteFile(id, req.user.tenantId);
  }
}
