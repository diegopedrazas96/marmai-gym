import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,
  UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentStatus } from '@marmai/shared';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Get all payments with optional filters' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'studentId', required: false, type: Number })
  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: PaymentStatus,
    @Query('studentId') studentId?: string,
  ) {
    return this.paymentsService.findAll({
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      status,
      studentId: studentId ? parseInt(studentId) : undefined,
    });
  }

  @ApiOperation({ summary: 'Get payment summary for a month' })
  @Get('summary')
  getSummary(@Query('month') month: string, @Query('year') year: string) {
    return this.paymentsService.getSummary(parseInt(month), parseInt(year));
  }

  @ApiOperation({ summary: 'Get all payments for a student' })
  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.findByStudent(studentId);
  }

  @ApiOperation({ summary: 'Get payment by id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a payment record' })
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @ApiOperation({ summary: 'Generate monthly payments for all active students' })
  @Post('generate')
  generate(@Body() body: { month: number; year: number; defaultAmount: number }) {
    return this.paymentsService.generateMonthlyPayments(body.month, body.year, body.defaultAmount);
  }

  @ApiOperation({ summary: 'Update payment status/amount' })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Mark payment as paid' })
  @Put(':id/pay')
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.markAsPaid(id);
  }

  @ApiOperation({ summary: 'Delete payment' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
