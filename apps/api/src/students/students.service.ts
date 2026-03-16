import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly?: boolean) {
    return this.prisma.student.findMany({
      where: activeOnly !== undefined ? { active: activeOnly } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: { include: { discipline: true }, where: { active: true } },
        payments: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 },
      },
    });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    return student;
  }

  async create(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }

  async deactivate(id: number) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: { active: false },
    });
  }
}
