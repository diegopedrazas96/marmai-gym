import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { DayOfWeek } from '@marmai/shared';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(disciplineId?: number) {
    return this.prisma.schedule.findMany({
      where: disciplineId ? { disciplineId } : undefined,
      include: { discipline: true, teacher: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findToday() {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const today = days[new Date().getDay()] as DayOfWeek;
    return this.prisma.schedule.findMany({
      where: { dayOfWeek: today },
      include: { discipline: true, teacher: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { discipline: true, teacher: true },
    });
    if (!schedule) throw new NotFoundException(`Schedule #${id} not found`);
    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: dto,
      include: { discipline: true, teacher: true },
    });
  }

  async update(id: number, dto: UpdateScheduleDto) {
    await this.findOne(id);
    return this.prisma.schedule.update({
      where: { id },
      data: dto,
      include: { discipline: true, teacher: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted successfully' };
  }
}
