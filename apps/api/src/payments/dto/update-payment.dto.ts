import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaymentStatus } from '@marmai/shared';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
