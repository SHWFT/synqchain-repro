import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('healthz')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'synqchain-api',
        version: '1.0.0',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'synqchain-api',
        version: '1.0.0',
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
