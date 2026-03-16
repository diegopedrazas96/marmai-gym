import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplinesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.discipline.findMany({
      include: {
        _count: { select: { enrollments: true, schedules: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const discipline = await this.prisma.discipline.findUnique({
      where: { id },
      include: {
        schedules: { include: { teacher: true } },
        enrollments: { include: { student: true }, where: { active: true } },
      },
    });
    if (!discipline) throw new NotFoundException(`Discipline #${id} not found`);
    return discipline;
  }

  async create(dto: CreateDisciplineDto) {
    const exists = await this.prisma.discipline.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`Discipline "${dto.name}" already exists`);
    return this.prisma.discipline.create({ data: dto });
  }

  async update(id: number, dto: UpdateDisciplineDto) {
    await this.findOne(id);
    return this.prisma.discipline.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.discipline.delete({ where: { id } });
    return { message: 'Discipline deleted successfully' };
  }
}
