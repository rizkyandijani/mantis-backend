import { PrismaClient, Role, MachineStatus, DailyMaintenanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Step 1: Clear existing data
  await prisma.questionResponse.deleteMany();
  await prisma.dailyMaintenance.deleteMany();
  await prisma.questionTemplate.deleteMany();
  await prisma.machineStatusLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.machine.deleteMany();

  // Step 2: Seed Machines
  await prisma.machine.createMany({
    data: [
      {
        id: 'B1',
        inventoryId: 'INV-B1',
        name: 'Bubut 1',
        machineCommonType: 'Lathe Machine',
        machineGroup: 'Group A',
        machineSpecificType: 'BUBUT-STD',
        section: 'Bubut Dasar',
        unit: 'WBS',
        status: MachineStatus.OPERATIONAL,
      },
      {
        id: 'B2',
        inventoryId: 'INV-B2',
        name: 'Bubut 2',
        machineCommonType: 'Lathe Machine',
        machineGroup: 'Group A',
        machineSpecificType: 'BUBUT-STD',
        section: 'Bubut Dasar',
        unit: 'WBS',
        status: MachineStatus.OPERATIONAL,
      },
      {
        id: 'F1',
        inventoryId: 'INV-F1',
        name: 'Frais 1',
        machineCommonType: 'Milling Machine',
        machineGroup: 'Group B',
        machineSpecificType: 'FRAIS-STD',
        section: 'Frais Dasar',
        unit: 'WBS',
        status: MachineStatus.OPERATIONAL,
      },
      {
        id: 'F2',
        inventoryId: 'INV-F2',
        name: 'Frais 2',
        machineCommonType: 'Milling Machine',
        machineGroup: 'Group B',
        machineSpecificType: 'FRAIS-STD',
        section: 'Frais Dasar',
        unit: 'WBS',
        status: MachineStatus.OPERATIONAL,
      },
    ],
  });

  // Step 3: Seed Users
  const hashedPassword = async (pass: string) => await bcrypt.hash(pass, 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Student 1',
        role: Role.student,
        email: 'student1wbs@mail.com',
        password: await hashedPassword('student123'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Student 2',
        role: Role.student,
        email: 'student2wbs@mail.com',
        password: await hashedPassword('student123'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Student 3',
        role: Role.student,
        email: 'student3wbs@mail.com',
        password: await hashedPassword('student123'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Instructor 1',
        role: Role.instructor,
        email: 'instructor1wbs@mail.com',
        password: await hashedPassword('instructor123'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Admin 1',
        role: Role.admin,
        email: 'adminmantis1@mail.com',
        password: await hashedPassword('admin123'),
      },
    }),
  ]);

  const students = users.filter((u) => u.role === Role.student);

  // Step 4: Seed Question Templates
  const bubutTemplates = await Promise.all([
    prisma.questionTemplate.create({
      data: {
        machineCommonType: 'Lathe Machine',
        order: 1,
        question: 'Apakah sistem pendingin berfungsi dengan baik?',
      },
    }),
    prisma.questionTemplate.create({
      data: {
        machineCommonType: 'Lathe Machine',
        order: 2,
        question: 'Apakah ada kebocoran oli?',
      },
    }),
    prisma.questionTemplate.create({
      data: {
        machineCommonType: 'Lathe Machine',
        order: 3,
        question: 'Apakah rel gerak sudah dibersihkan?',
      },
    }),
  ]);

  const fraisTemplates = await Promise.all([
    prisma.questionTemplate.create({
      data: {
        machineCommonType: 'Milling Machine',
        order: 1,
        question: 'Apakah spindle berjalan lancar?',
      },
    }),
    prisma.questionTemplate.create({
      data: {
        machineCommonType: 'Milling Machine',
        order: 2,
        question: 'Apakah sistem pelumasan cukup?',
      },
    }),
    prisma.questionTemplate.create({
      data: {
        machineCommonType: 'Milling Machine',
        order: 3,
        question: 'Apakah meja kerja bersih dari serpihan?',
      },
    }),
  ]);

  // Step 5: Seed Daily Maintenance with responses
  const months = ['2025-04', '2025-05', '2025-06'];
  const machineTypes: Record<string, string> = {
    B1: 'Lathe Machine',
    B2: 'Lathe Machine',
    F1: 'Milling Machine',
    F2: 'Milling Machine',
  };

  for (const month of months) {
    for (let day = 1; day <= 5; day++) {
      for (const [index, machineId] of Object.keys(machineTypes).entries()) {
        const date = startOfDay(new Date(`${month}-${String(day).padStart(2, '0')}`));
        const student = students[index % students.length];
        const templates = await prisma.questionTemplate.findMany({
          where: { machineCommonType: machineTypes[machineId] },
          orderBy: { order: 'asc' },
        });

        const maintenance = await prisma.dailyMaintenance.create({
          data: {
            date,
            dateOnly: date,
            machineId,
            studentId: student.id,
            studentName: student.name || 'Unknown',
            status: DailyMaintenanceStatus.APPROVED,
            responses: {
              create: templates.map((q, i) => ({
                questionId: q.id,
                answer: i % 2 === 0,
              })),
            },
          },
        });
      }
    }
  }

  console.log('✅ Seeder finished.');
}

main()
  .catch((e) => {
    console.error('Seeder error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
