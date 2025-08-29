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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('search') search?: string) {
    return this.suppliersService.findAll(req.user.tenantId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.suppliersService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto, @Req() req: Request) {
    return this.suppliersService.create(createSupplierDto, req.user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Req() req: Request
  ) {
    return this.suppliersService.update(id, updateSupplierDto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.suppliersService.remove(id, req.user.tenantId);
  }
}
