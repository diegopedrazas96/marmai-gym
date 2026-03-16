import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsInt()
  studentId!: number;

  @ApiProperty()
  @IsInt()
  disciplineId!: number;
}
