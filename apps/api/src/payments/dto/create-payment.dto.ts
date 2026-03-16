import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaymentStatus } from '@marmai/shared';

export class CreatePaymentDto {
  @ApiProperty()
  @IsInt()
  studentId!: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty()
  @IsInt()
  year!: number;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
