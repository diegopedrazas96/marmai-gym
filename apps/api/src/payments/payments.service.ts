import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from '@marmai/shared';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { month?: number; year?: number; status?: PaymentStatus; studentId?: number }) {
    return this.prisma.payment.findMany({
      where: {
        month: filters.month,
        year: filters.year,
        status: filters.status,
        studentId: filters.studentId,
      },
      include: { student: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { student: { name: 'asc' } }],
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!payment) throw new NotFoundException(`Payment #${id} not found`);
    return payment;
  }

  async findByStudent(studentId: number) {
    return this.prisma.payment.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getSummary(month: number, year: number) {
    const payments = await this.prisma.payment.findMany({
      where: { month, year },
      include: { student: { select: { id: true, name: true } } },
    });

    const total = payments.length;
    const paid = payments.filter((p) => p.status === 'PAID').length;
    const pending = payments.filter((p) => p.status === 'PENDING').length;
    const overdue = payments.filter((p) => p.status === 'OVERDUE').length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const collectedAmount = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { total, paid, pending, overdue, totalAmount, collectedAmount };
  }

  async create(dto: CreatePaymentDto) {
    const existing = await this.prisma.payment.findUnique({
      where: { studentId_month_year: { studentId: dto.studentId, month: dto.month, year: dto.year } },
    });

    if (existing) {
      // Upsert: if a payment record already exists (e.g. auto-generated as PENDING),
      // update it with the provided data instead of rejecting.
      return this.prisma.payment.update({
        where: { id: existing.id },
        data: {
          amount: dto.amount ?? existing.amount,
          status: dto.status ?? existing.status,
          notes: dto.notes ?? existing.notes,
          paidAt:
            (dto.status ?? existing.status) === PaymentStatus.PAID
              ? existing.paidAt ?? new Date()
              : existing.paidAt,
        },
        include: { student: { select: { id: true, name: true } } },
      });
    }

    return this.prisma.payment.create({
      data: {
        ...dto,
        paidAt: dto.status === PaymentStatus.PAID ? new Date() : undefined,
      },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async update(id: number, dto: UpdatePaymentDto) {
    await this.findOne(id);
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...dto,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : dto.status === PaymentStatus.PAID ? new Date() : undefined,
      },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async markAsPaid(id: number) {
    return this.update(id, { status: PaymentStatus.PAID, paidAt: new Date().toISOString() });
  }

  async generateMonthlyPayments(month: number, year: number, defaultAmount: number) {
    const activeStudents = await this.prisma.student.findMany({
      where: { active: true },
    });

    const created: number[] = [];
    for (const student of activeStudents) {
      const existing = await this.prisma.payment.findUnique({
        where: { studentId_month_year: { studentId: student.id, month, year } },
      });
      if (!existing) {
        await this.prisma.payment.create({
          data: { studentId: student.id, month, year, amount: defaultAmount, status: 'PENDING' },
        });
        created.push(student.id);
      }
    }

    return { message: `Generated ${created.length} payments`, generatedFor: created.length };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });
    return { message: 'Payment deleted successfully' };
  }
}
