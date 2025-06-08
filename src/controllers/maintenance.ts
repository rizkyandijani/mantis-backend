import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';

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

// ✅ 2. Get All daily Maintenances
export const getAllDailyMaintenances = async (req: Request, res: Response) => {
  try {
    const records = await prisma.dailyMaintenance.findMany({
      include: { machine: true, responses: true },
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all maintenance records' });
  }
};


// ✅ 2. Get All monthly Maintenances
export const getMonthlyMaintenances = async (req: Request, res: Response) => {
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

export const getAllMachines = async (_req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

export const getChecklistTemplate = async (req: Request, res: Response) => {
  const { machineId } = req.params;
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { machineId },
      orderBy: { order: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

export const submitDailyChecklist = async (req: Request, res: Response) => {
  const { machineId, studentId, responses } = req.body;

  try {
    const daily = await prisma.dailyMaintenance.create({
      data: {
        machineId,
        studentId,
        date: new Date(),
        responses: {
          create: responses.map((r: any) => ({
            question: r.question,
            answer: r.answer
          }))
        }
      },
      include: {
        responses: true
      }
    });

    res.status(201).json(daily);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit checklist' });
  }
};

export const getMonthlySummary = async (req: Request, res: Response) => {
  const { year, month } = req.query;

  
  const from = year && month ? startOfMonth(new Date(Number(year), Number(month) - 1)) : new Date(0); // Start from epoch if year/month not provided
  const to = year && month ? endOfMonth(from) : new Date(); // End at current date if year/month not provided
  
  if (year && month && (!year || !month)) {
    res.status(400).json({ error: 'Missing year or month' });
  }

  // const from = startOfMonth(new Date(Number(year), Number(month) - 1));
  // const to = endOfMonth(from);

  try {
    const maintenances = await prisma.dailyMaintenance.findMany({
      where: {
        date: {
          gte: from,
          lte: to
        }
      },
      include: {
        machine: true
      }
    });

    const machineMap = new Map<string, any>();
    maintenances.forEach((m) => {
      const id = m.machineId;
      const key = `${id}-${m.date.getFullYear()}-${m.date.getMonth() + 1}`;
      if (!machineMap.has(key)) {
        machineMap.set(key, {
          month: `${m.date.toLocaleString('default', { month: 'long' })}`,
          year: `${m.date.getFullYear()}`,
          section: m.machine.section,
          unit: m.machine.unit,
          machineType: m.machine.type,
          machineName: m.machine.name,
          reportedDays: 1,
          totalWorkingDays: 0 // placeholder
        });
      } else {
        machineMap.get(key).reportedDays++;
      }
    });

    // Assume max 22 workdays per month for simplicity
    const summary = Array.from(machineMap.values()).map((row) => ({
      ...row,
      totalWorkingDays: 22,
      percentage: `${((row.reportedDays / 22) * 100).toFixed(2)}%`
    }));

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
};
