import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { DisciplinesModule } from './disciplines/disciplines.module';
import { SchedulesModule } from './schedules/schedules.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TeachersModule,
    StudentsModule,
    DisciplinesModule,
    SchedulesModule,
    EnrollmentsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
