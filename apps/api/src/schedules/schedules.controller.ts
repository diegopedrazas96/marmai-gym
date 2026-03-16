import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@marmai/shared';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiOperation({ summary: 'Get all schedules, optionally filter by discipline' })
  @ApiQuery({ name: 'disciplineId', required: false, type: Number })
  @Get()
  findAll(@Query('disciplineId') disciplineId?: string) {
    return this.schedulesService.findAll(disciplineId ? parseInt(disciplineId) : undefined);
  }

  @ApiOperation({ summary: "Get today's schedules" })
  @Get('today')
  findToday() {
    return this.schedulesService.findToday();
  }

  @ApiOperation({ summary: 'Get schedule by id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create schedule (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @ApiOperation({ summary: 'Update schedule (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete schedule (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}
