import { PrismaClient, Role, DayOfWeek } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@marmai.gym' },
    update: {},
    create: {
      email: 'admin@marmai.gym',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('Admin user created:', adminUser.email);

  const teacherPasswordHash = await bcrypt.hash('teacher123', 10);

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@marmai.gym' },
    update: {},
    create: {
      email: 'teacher@marmai.gym',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
      teacher: {
        create: {
          name: 'Carlos García',
          phone: '+54 11 1234-5678',
          specialties: 'Yoga, Pilates',
        },
      },
    },
  });

  console.log('Teacher user created:', teacherUser.email);

  const yoga = await prisma.discipline.upsert({
    where: { name: 'Yoga' },
    update: {},
    create: { name: 'Yoga', description: 'Clases de yoga para todos los niveles', color: '#8b5cf6' },
  });

  const crossfit = await prisma.discipline.upsert({
    where: { name: 'CrossFit' },
    update: {},
    create: { name: 'CrossFit', description: 'Entrenamiento funcional de alta intensidad', color: '#ef4444' },
  });

  const pilates = await prisma.discipline.upsert({
    where: { name: 'Pilates' },
    update: {},
    create: { name: 'Pilates', description: 'Ejercicios de control corporal y respiración', color: '#10b981' },
  });

  console.log('Disciplines created:', yoga.name, crossfit.name, pilates.name);

  const teacher = await prisma.teacher.findFirst();
  if (teacher) {
    await prisma.schedule.upsert({
      where: { disciplineId_dayOfWeek_startTime: { disciplineId: yoga.id, dayOfWeek: DayOfWeek.MONDAY, startTime: '09:00' } },
      update: {},
      create: { disciplineId: yoga.id, teacherId: teacher.id, dayOfWeek: DayOfWeek.MONDAY, startTime: '09:00', endTime: '10:00' },
    });

    await prisma.schedule.upsert({
      where: { disciplineId_dayOfWeek_startTime: { disciplineId: yoga.id, dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '09:00' } },
      update: {},
      create: { disciplineId: yoga.id, teacherId: teacher.id, dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '09:00', endTime: '10:00' },
    });
  }

  const student1 = await prisma.student.upsert({
    where: { email: 'ana@example.com' },
    update: {},
    create: { name: 'Ana Martínez', email: 'ana@example.com', phone: '+54 11 9876-5432', active: true },
  });

  const student2 = await prisma.student.upsert({
    where: { email: 'juan@example.com' },
    update: {},
    create: { name: 'Juan López', email: 'juan@example.com', phone: '+54 11 5555-1234', active: true },
  });

  console.log('Students created:', student1.name, student2.name);

  await prisma.enrollment.upsert({
    where: { studentId_disciplineId: { studentId: student1.id, disciplineId: yoga.id } },
    update: {},
    create: { studentId: student1.id, disciplineId: yoga.id },
  });

  await prisma.enrollment.upsert({
    where: { studentId_disciplineId: { studentId: student2.id, disciplineId: crossfit.id } },
    update: {},
    create: { studentId: student2.id, disciplineId: crossfit.id },
  });

  const now = new Date();
  await prisma.payment.upsert({
    where: { studentId_month_year: { studentId: student1.id, month: now.getMonth() + 1, year: now.getFullYear() } },
    update: {},
    create: { studentId: student1.id, month: now.getMonth() + 1, year: now.getFullYear(), amount: 5000, status: 'PENDING' },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
