import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@marmai/shared';

@ApiTags('teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @ApiOperation({ summary: 'Get all teachers' })
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @ApiOperation({ summary: 'Get teacher by id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create teacher (admin only)' })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @ApiOperation({ summary: 'Update teacher (admin only)' })
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete teacher (admin only)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }
}
