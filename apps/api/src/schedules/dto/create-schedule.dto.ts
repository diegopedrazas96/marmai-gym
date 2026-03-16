import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsString, Matches } from 'class-validator';
import { DayOfWeek } from '@marmai/shared';

export class CreateScheduleDto {
  @ApiProperty()
  @IsInt()
  disciplineId!: number;

  @ApiProperty()
  @IsInt()
  teacherId!: number;

  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be HH:MM format' })
  startTime!: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be HH:MM format' })
  endTime!: string;
}
