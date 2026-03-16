import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,
  UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @Get()
  findAll(@Query('active') active?: string) {
    const activeOnly = active === 'true' ? true : active === 'false' ? false : undefined;
    return this.studentsService.findAll(activeOnly);
  }

  @ApiOperation({ summary: 'Get student by id with enrollments and payments' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create student' })
  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @ApiOperation({ summary: 'Update student' })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Deactivate student' })
  @Put(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.deactivate(id);
  }

  @ApiOperation({ summary: 'Delete student' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
