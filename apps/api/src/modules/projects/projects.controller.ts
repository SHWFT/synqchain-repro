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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('search') search?: string) {
    return this.projectsService.findAll(req.user.tenantId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.projectsService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: Request) {
    return this.projectsService.create(createProjectDto, req.user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: Request
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.projectsService.remove(id, req.user.tenantId);
  }
}
