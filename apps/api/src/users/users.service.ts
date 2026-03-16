import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@marmai/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(email: string, password: string, role: Role) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return user;
  }

  async updatePassword(id: number, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, email: true, role: true },
    });
  }
}
