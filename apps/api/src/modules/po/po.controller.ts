import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { Request } from 'express';
import { PoService } from './po.service';
import { CreatePoDto, UpdatePoDto, SubmitPoDto, ApprovePoDto } from './dto/po.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('po')
@UseGuards(JwtAuthGuard)
export class PoController {
  constructor(private readonly poService: PoService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('search') search?: string) {
    return this.poService.findAll(req.user.tenantId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.poService.findOne(id, req.user.tenantId);
  }

  @Get(':id/events')
  async getEvents(@Param('id') id: string, @Req() req: Request) {
    return this.poService.getEvents(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() createPoDto: CreatePoDto, @Req() req: Request) {
    return this.poService.create(createPoDto, req.user.tenantId, req.user.email);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePoDto: UpdatePoDto,
    @Req() req: Request
  ) {
    return this.poService.update(id, updatePoDto, req.user.tenantId, req.user.email);
  }

  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Body() submitPoDto: SubmitPoDto,
    @Req() req: Request
  ) {
    return this.poService.submit(id, submitPoDto, req.user.tenantId, req.user.email);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() approvePoDto: ApprovePoDto,
    @Req() req: Request
  ) {
    return this.poService.approve(id, approvePoDto, req.user.tenantId, req.user.email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.poService.remove(id, req.user.tenantId);
  }
}
