import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsEnum, IsString, IsOptional, Matches } from 'class-validator';
import { DayOfWeek } from '@marmai/shared';

export class UpdateScheduleDto {
  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  teacherId?: number;

  @ApiPropertyOptional({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({ example: '09:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be HH:MM format' })
  startTime?: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be HH:MM format' })
  endTime?: string;
}
