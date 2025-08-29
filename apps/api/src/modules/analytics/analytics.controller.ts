import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKpis(
    @Req() req: Request,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    return this.analyticsService.getKpis(req.user.tenantId, start, end);
  }
}
