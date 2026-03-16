import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisciplinesService } from './disciplines.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@marmai/shared';

@ApiTags('disciplines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disciplines')
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @ApiOperation({ summary: 'Get all disciplines' })
  @Get()
  findAll() {
    return this.disciplinesService.findAll();
  }

  @ApiOperation({ summary: 'Get discipline by id with schedules and enrollments' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.disciplinesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create discipline (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateDisciplineDto) {
    return this.disciplinesService.create(dto);
  }

  @ApiOperation({ summary: 'Update discipline (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto) {
    return this.disciplinesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete discipline (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.disciplinesService.remove(id);
  }
}
