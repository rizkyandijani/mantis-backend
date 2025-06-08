import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ 1. Create Daily Maintenance
export const createDailyMaintenance = async (req: Request, res: Response) => {
  const { machineId, studentId, responses } = req.body;

  try {
    const result = await prisma.dailyMaintenance.create({
      data: {
        machineId,
        studentId,
        responses: {
          create: responses.map((r: { question: string; answer: string }) => ({
            question: r.question,
            answer: r.answer
          }))
        }
      },
      include: { responses: true }
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create daily maintenance' });
  }
};

// ✅ 2. Get All Daily Maintenances
export const getDailyMaintenances = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  console.log("cek request", req)
  console.log("cek month and year", month, year)
  console.log("cek req.params", req.query)
  try {
    const monthNumber = month ? parseInt(month as string) : 0; // Ensure month is a number
    const records = await prisma.dailyMaintenance.findMany({
      where: {
        date: {
          gte: new Date(`${year}-${monthNumber > 0 ? monthNumber : '01'}-01`),
          lt: new Date(`${year}-${monthNumber + 1}-01`)
        }
      },
      include: { machine: true, responses: true },
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

// ✅ 3. Get Monthly Summary (Total per day)
export const getMonthlySummary = async (req: Request, res: Response) => {
  const { month, year } = req.query;

try {
    const monthNumber = month ? parseInt(month as string) : 0; // Ensure month is a number
    const result = await prisma.dailyMaintenance.groupBy({
        by: ['date'],
        where: {
            date: {
                gte: new Date(`${year}-${monthNumber > 0 ? monthNumber : '01'}-01`), // Ensure month is defined
                lt: new Date(`${year}-${monthNumber + 1}-01`)
            }
        },
        _count: true,
        orderBy: { date: 'asc' }
    });

    res.json(result);
} catch (err) {
    res.status(500).json({ error: 'Failed to summarize by date' });
  }
};

// ✅ 4. Get Monthly Summary By Machine
export const getMonthlySummaryByMachine = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  const { machineId } = req.params 
  try {
    const monthNumber = month ? parseInt(month as string) : 0;
    const result = await prisma.dailyMaintenance.findMany({
      where: {
        machineId: machineId,
        date: {
          gte: new Date(`${year}-${monthNumber > 0 ? monthNumber : '01'}-01`),
          lt: new Date(`${year}-${monthNumber + 1}-01`)
        }
      },
      include: { machine: true }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to summarize by machine' });
  }
};

// ✅ 5. Get Monthly Summary By Section
export const getMonthlySummaryBySection = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  const { section } = req.params

  try {
    const monthNumber = month ? parseInt(month as string) : 0;
    const result = await prisma.dailyMaintenance.findMany({
      where: {
        machine: {
          section: section
        },
        date: {
          gte: new Date(`${year}-${monthNumber > 0 ? monthNumber : '01'}-01`),
          lt: new Date(`${year}-${monthNumber + 1}-01`)
        }
      },
      include: { machine: true }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to summarize by section' });
  }
};

// ✅ 6. Get Monthly Summary By Unit
export const getMonthlySummaryByUnit = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  const { unit } = req.params

  try {
    const monthNumber = month ? parseInt(month as string) : 0;
    const result = await prisma.dailyMaintenance.findMany({
      where: {
        machine: {
          unit: unit
        },
        date: {
          gte: new Date(`${year}-${monthNumber > 0 ? monthNumber : '01'}-01`),
          lt: new Date(`${year}-${monthNumber + 1}-01`)
        }
      },
      include: { machine: true }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to summarize by unit' });
  }
};
