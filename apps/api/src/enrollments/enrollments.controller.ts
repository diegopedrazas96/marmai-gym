import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @ApiOperation({ summary: 'Get enrollments for a student' })
  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.enrollmentsService.findByStudent(studentId);
  }

  @ApiOperation({ summary: 'Get active students enrolled in a discipline' })
  @Get('discipline/:disciplineId')
  findByDiscipline(@Param('disciplineId', ParseIntPipe) disciplineId: number) {
    return this.enrollmentsService.findByDiscipline(disciplineId);
  }

  @ApiOperation({ summary: 'Enroll student in a discipline' })
  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @ApiOperation({ summary: 'Unenroll student from a discipline' })
  @Delete('student/:studentId/discipline/:disciplineId')
  unenroll(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('disciplineId', ParseIntPipe) disciplineId: number,
  ) {
    return this.enrollmentsService.unenroll(studentId, disciplineId);
  }
}
