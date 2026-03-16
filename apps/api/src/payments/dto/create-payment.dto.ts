import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
