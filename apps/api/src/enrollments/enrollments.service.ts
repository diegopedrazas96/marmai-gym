import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async findByStudent(studentId: number) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: { discipline: true },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findByDiscipline(disciplineId: number) {
    return this.prisma.enrollment.findMany({
      where: { disciplineId, active: true },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    });
  }

  async create(dto: CreateEnrollmentDto) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_disciplineId: { studentId: dto.studentId, disciplineId: dto.disciplineId } },
    });

    if (existing) {
      if (existing.active) throw new ConflictException('Student is already enrolled in this discipline');
      return this.prisma.enrollment.update({
        where: { id: existing.id },
        data: { active: true, enrolledAt: new Date() },
        include: { student: true, discipline: true },
      });
    }

    return this.prisma.enrollment.create({
      data: dto,
      include: { student: true, discipline: true },
    });
  }

  async unenroll(studentId: number, disciplineId: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_disciplineId: { studentId, disciplineId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { active: false },
    });
  }
}
