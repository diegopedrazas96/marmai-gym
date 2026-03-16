import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Role } from '@marmai/shared';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async findAll() {
    return this.prisma.teacher.findMany({
      include: { user: { select: { id: true, email: true, role: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        schedules: { include: { discipline: true } },
      },
    });
    if (!teacher) throw new NotFoundException(`Teacher #${id} not found`);
    return teacher;
  }

  async create(dto: CreateTeacherDto) {
    const user = await this.usersService.create(dto.email, dto.password, Role.TEACHER);
    return this.prisma.teacher.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        specialties: dto.specialties,
        userId: user.id,
      },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async update(id: number, dto: UpdateTeacherDto) {
    await this.findOne(id);
    return this.prisma.teacher.update({
      where: { id },
      data: dto,
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async remove(id: number) {
    const teacher = await this.findOne(id);
    await this.prisma.teacher.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: teacher.userId } });
    return { message: 'Teacher deleted successfully' };
  }
}
