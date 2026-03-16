import { DayOfWeek, PaymentStatus, Role } from './enums';

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: Role;
}

// Teacher DTOs
export interface CreateTeacherDto {
  name: string;
  phone?: string;
  specialties?: string;
  email: string;
  password: string;
}

export interface UpdateTeacherDto {
  name?: string;
  phone?: string;
  specialties?: string;
}

// Student DTOs
export interface CreateStudentDto {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export interface UpdateStudentDto {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  active?: boolean;
}

// Discipline DTOs
export interface CreateDisciplineDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateDisciplineDto {
  name?: string;
  description?: string;
  color?: string;
}

// Schedule DTOs
export interface CreateScheduleDto {
  disciplineId: number;
  teacherId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface UpdateScheduleDto {
  teacherId?: number;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
}

// Enrollment DTOs
export interface CreateEnrollmentDto {
  studentId: number;
  disciplineId: number;
}

// Payment DTOs
export interface CreatePaymentDto {
  studentId: number;
  month: number;
  year: number;
  amount: number;
  notes?: string;
}

export interface UpdatePaymentDto {
  status?: PaymentStatus;
  amount?: number;
  notes?: string;
  paidAt?: string;
}

export interface PaymentFilterDto {
  month?: number;
  year?: number;
  status?: PaymentStatus;
  studentId?: number;
}
