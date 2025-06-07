import { PrismaClient, MachineType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed mesin
  await prisma.machine.deleteMany(); // Clear existing data
  await prisma.machine.createMany({
    data: [
      {id: 'B1', name: 'Bubut 1', type: 'BUBUT', section: 'Bubut Dasar', unit: 'WBS' },
      {id: 'B2', name: 'Bubut 2', type: 'BUBUT', section: 'Bubut Dasar', unit: 'WBS' },
      {id: 'F1', name: 'Frais 1', type: 'FRAIS', section: 'Frais Dasar', unit: 'WBS' },
      {id: 'F2', name: 'Frais 2', type: 'FRAIS', section: 'Frais Dasar', unit: 'WBS' },
    ],
  });

  // Seed checklist questions
  await prisma.checklistTemplate.deleteMany(); // Clear existing data
  await prisma.checklistTemplate.createMany({
    data: [
      // Untuk mesin BUBUT
      { machineType: 'BUBUT', order: 1,question: 'Apakah sistem pendingin berfungsi dengan baik?' },
      { machineType: 'BUBUT', order: 2,question: 'Apakah ada kebocoran oli?' },
      { machineType: 'BUBUT', order: 3,question: 'Apakah rel gerak sudah dibersihkan?' },

      // Untuk mesin FRAIS
      { machineType: 'FRAIS', order: 1,question: 'Apakah spindle berjalan lancar?' },
      { machineType: 'FRAIS', order: 2,question: 'Apakah sistem pelumasan cukup?' },
      { machineType: 'FRAIS', order: 3,question: 'Apakah meja kerja bersih dari serpihan?' },
    ],
  });

  // 4. Seed Daily Maintenance + Checklist Responses
await prisma.dailyMaintenance.deleteMany(); // Clear existing data
await prisma.dailyMaintenance.create({
    data: {
      machineId: 'B1',
      studentId: 'S001',
      date: new Date('2025-06-01'),
      responses: {
        create: [
          {
            question: 'Apakah ada kebocoran oli?',
            answer: 'Tidak'
          },
          {
            question: 'Apakah rel gerak sudah dibersihkan?',
            answer: 'Ya'
          }
        ]
      }
    }
  });
  
  await prisma.dailyMaintenance.create({
    data: {
      machineId: 'F2',
      studentId: 'S002',
      date: new Date('2025-06-02'),
      responses: {
        create: [
          {
            question: 'Apakah spindle berjalan lancar?',
            answer: 'Ya'
          },
          {
            question: 'Apakah meja kerja bersih dari serpihan?',
            answer: 'Tidak'
          }
        ]
      }
    }
  });

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
