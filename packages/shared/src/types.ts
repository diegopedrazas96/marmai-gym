import { DayOfWeek, PaymentStatus, Role } from './enums';

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface Teacher {
  id: number;
  userId: number;
  name: string;
  phone?: string;
  specialties?: string;
  user?: User;
}

export interface Student {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  active: boolean;
  createdAt: Date;
}

export interface Discipline {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
}

export interface Schedule {
  id: number;
  disciplineId: number;
  teacherId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  discipline?: Discipline;
  teacher?: Teacher;
}

export interface Enrollment {
  id: number;
  studentId: number;
  disciplineId: number;
  enrolledAt: Date;
  active: boolean;
  student?: Student;
  discipline?: Discipline;
}

export interface Payment {
  id: number;
  studentId: number;
  month: number;
  year: number;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
  notes?: string;
  student?: Student;
  createdAt: Date;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
