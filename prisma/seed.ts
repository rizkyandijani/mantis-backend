import { PrismaClient, MachineType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    // Seed mesin
    await prisma.questionResponse.deleteMany(); // Hapus dulu respon checklist
    await prisma.dailyMaintenance.deleteMany();  // Baru hapus daily maintenance
    await prisma.questionTemplate.deleteMany(); // Lalu hapus checklist template
    await prisma.user.deleteMany(); // Hapus semua user
    await prisma.machine.deleteMany();           // Sekarang aman hapus mesin
    await prisma.machine.createMany({
        data: [
        {id: 'B1', name: 'Bubut 1', type: 'BUBUT', section: 'Bubut Dasar', unit: 'WBS' },
        {id: 'B2', name: 'Bubut 2', type: 'BUBUT', section: 'Bubut Dasar', unit: 'WBS' },
        {id: 'F1', name: 'Frais 1', type: 'FRAIS', section: 'Frais Dasar', unit: 'WBS' },
        {id: 'F2', name: 'Frais 2', type: 'FRAIS', section: 'Frais Dasar', unit: 'WBS' },
        ],
    });

    // Seed checklist questions
    await prisma.questionTemplate.createMany({
        data: [
        // Untuk mesin BUBUT
        { machineType: 'BUBUT', order: 1, question: 'Apakah sistem pendingin berfungsi dengan baik?' },
        { machineType: 'BUBUT', order: 2, question: 'Apakah ada kebocoran oli?' },
        { machineType: 'BUBUT', order: 3, question: 'Apakah rel gerak sudah dibersihkan?' },

        // Untuk mesin FRAIS
        { machineType: 'FRAIS', order: 1, question: 'Apakah spindle berjalan lancar?' },
        { machineType: 'FRAIS', order: 2, question: 'Apakah sistem pelumasan cukup?' },
        { machineType: 'FRAIS', order: 3, question: 'Apakah meja kerja bersih dari serpihan?' },
        ],
    });
    const hashedPassword = async (pass: string) => await bcrypt.hash(pass, 10);
    const data = await prisma.user.createMany({
        data: [
        { name: 'Student 1', role: Role.student, email: 'student1wbs@mail.com', password: await hashedPassword('student123') },
        { name: 'Student 2', role: Role.student, email: 'student2wbs@mail.com', password: await hashedPassword('student123') },
        { name: 'Student 3', role: Role.student, email: 'student3wbs@mail.com', password: await hashedPassword('student123') },
        { name: 'Instructor 1', role: Role.instructor, email: 'instructur1wbs@mail.com', password: await hashedPassword('instructor123') },
        { name: 'Admin 1', role: Role.admin, email: 'adminmantis1@mail.com', password: await hashedPassword('admin123') }
        ]
    }) 

    // 4. Seed Daily Maintenance + Checklist Responses
    // Generate daily maintenance for 3 months for each machine
    const months = ['2025-04', '2025-05', '2025-06'];
    const studentEmails = ['student1wbs@mail.com', 'student2wbs@mail.com', 'student3wbs@mail.com'];
    const machines = [
    { id: 'B1', type: 'BUBUT' },
    { id: 'B2', type: 'BUBUT' },
    { id: 'F1', type: 'FRAIS' },
    { id: 'F2', type: 'FRAIS' }
    ];

    for (const month of months) {
    for (let day = 1; day <= 30; day++) {
        for (const [index, machine] of machines.entries()) {
        const date = startOfDay(new Date(`${month}-${String(day).padStart(2, '0')}`));
        const questions = await prisma.questionTemplate.findMany({
            where: { machineType: machine.type as MachineType },
            orderBy: { order: 'asc' }
        });

        await prisma.dailyMaintenance.create({
            data: {
                machineId: machine.id,
                studentEmail: studentEmails[index % studentEmails.length],
                dateOnly: date,
                responses: {
                    create: questions.map((q, i) => ({
                    questionId: q.id,
                    answer: i % 2 === 0 ? true : false
                    }))
                }
            }
        });
        }
    }
    }

  console.log('✅ Seeder finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
