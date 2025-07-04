import { Request, Response } from 'express';
import { PrismaClient, DailyMaintenanceStatus } from '@prisma/client';
import { differenceInDays, format, startOfDay } from 'date-fns';
import { CodeError } from '../libs/code_error';
import { AuthRequest } from '../middleware/auth';
import { r2 } from "../libs/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { machine } from 'os';

const prisma = new PrismaClient();

// ✅ 1. Create Daily Maintenance
export const createDailyMaintenance = async (req: Request, res: Response) => {
  const { machineId, studentId, studentName, instructorId, responses } = req.body;
  console.log("cek machineId, studentId, studentName, responses, instructorId", machineId, studentId, studentName, responses, instructorId)

  if (!machineId || !studentId || !studentName || !instructorId || !Array.isArray(responses)) {
    res.status(400).json({ error: 'Invalid payload' });
    throw new Error('Invalid create daily maintenance payload')
  }

  const today = startOfDay(new Date());

  const alreadyExists = await prisma.dailyMaintenance.findFirst({
    where: {
      machineId,
      dateOnly: today,
    },
  });

  if (alreadyExists) {
    throw new CodeError('Maintenance for today already exists', 400)
  }

  try {
    const dailyMaintenance = await prisma.dailyMaintenance.create({
      data: {
        machineId,
        studentName,
        studentId,
        dateOnly: today,
        approvedById: instructorId,
        status: DailyMaintenanceStatus.PENDING,
        responses: {
          create: responses.map(r => ({
            answer: r.answer,
            questionId: r.questionId,
            evidenceUrl: r.evidenceUrl
          }))
        }
      },
      include: { responses: true }
    });

    res.status(201).json(dailyMaintenance);
  } catch (error) {
    console.error("Error creating daily maintenance:", error);
    throw {actualError: error, fallBackMessage: 'Failed to create daily maintenance', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to create daily maintenance' });
  }
};

// ✅ 2. Get All daily Maintenances
export const getAllDailyMaintenances = async (req: Request, res: Response) => {
  try {
    const records = await prisma.dailyMaintenance.findMany({
      include: { machine: true, responses: true, approvedBy: true },
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch all maintenance records', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch all maintenance records' });
  }
};

export const getDailyMaintenancesByStatus = async (req: Request, res: Response) => {
  const { status, approverId } = req.params;

  if (!status) {
    throw new CodeError('Status parameter is required', 400)
  }

  try {
    const records = await prisma.dailyMaintenance.findMany({
      where: { status: status as DailyMaintenanceStatus, approvedById: approverId },
      include: { machine: true, responses: true },
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (error) {
    throw {actualError: error, fallBackMessage: `Failed to fetch maintenance records with status ${status}`, fallBackCode: 500};
    // res.status(500).json({ error: `Failed to fetch maintenance records with status ${status}` });
  }
}

export const getMaintenanceByStudent = async (req: AuthRequest, res: Response) => {
  const { sub } = req.user;

  try {
    const student = await prisma.user.findUnique({
      where: {id: sub}
    })
    if(!student){
      throw new CodeError('Student ID not found', 404)
    }
    const records = await prisma.dailyMaintenance.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        machine: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching student maintenance:", error);
    throw {actualError: error, fallBackMessage: `Error fetching student maintenance:`, fallBackCode: 500};
    // return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDailyMaintenancesDetail = async (req: Request, res: Response) => {
  const { maintenanceId } = req.params;

  if (!maintenanceId) {
    res.status(400).json({ error: 'maintenance Id parameter is required' });
  }

  try {
    const result = await prisma.dailyMaintenance.findUnique({
      where: { id: maintenanceId },
      include: {machine: true, responses: {include: {question: true}}}
    });
    res.status(200).json(result);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch maintenance detail', fallBackCode: 500};
    // res.status(500).json({ error: `Failed to fetch maintenance detail` });
  }
}

export const approveOrRejectDailyMaintenance = async (req: Request, res: Response) => {
  const { maintenanceId } = req.params;
  const { status, note } = req.body

  if (!maintenanceId) {
    throw new CodeError('maintenance Id parameter is required', 400)
  }

  try {
    const result = await prisma.dailyMaintenance.findUnique({
      where: { id: maintenanceId },
      include: {machine: true, responses: true}
    });
    if(!result){
      throw new CodeError('No maintenance records found', 404)
    }
    if (result.status !== DailyMaintenanceStatus.PENDING) {
      throw new CodeError('Maintenance is not in pending status', 400);
    }
    const updatedMaintenance = await prisma.dailyMaintenance.update({
      where: { id: maintenanceId },
      data: {
        status: status as DailyMaintenanceStatus,
        approvedAt: new Date(),
        approvalNote: note,
      },
      include: {machine: true, responses: {
        include: {question: true}
      },}
    });
    res.status(200).json(updatedMaintenance);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to Approve or Reject maintenance detail', fallBackCode: 500};
    // res.status(500).json({ error: `Failed to fetch maintenance detail` });
  }
}


// ✅ 2. Get All monthly Maintenances
export const getMonthlyMaintenances = async (req: Request, res: Response) => {
  const { month, year } = req.query;
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
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch monthly maintenance records', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch maintenance records' });
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
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to summarize by machine', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to summarize by machine' });
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
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to summarize by section', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to summarize by section' });
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
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to summarize by unit', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to summarize by unit' });
  }
};

export const getAllMachines = async (_req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch all machines', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

export const getQuestionTemplate = async (req: Request, res: Response) => {
  const { machineId } = req.params;
  try {
    const templates = await prisma.questionTemplate.findMany({
      where: { machineId },
      orderBy: { order: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch template', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch template' });
  }
};

export const getMonthlySummary = async (req: Request, res: Response) => {
  const { from, to } = req.query;

  
  const fromVal = from ? new Date(from as string) : new Date(0); // Start from epoch if year/month not provided
  const toVal = to ? new Date(to as string) : new Date(); // End at current date if year/month not provided
  
  if (from && to && (!from || !to)) {
    throw new CodeError('Missing from or to value', 400)
  }

  const useDaily = differenceInDays(toVal, fromVal) < 90;

  try {
    const maintenances = await prisma.dailyMaintenance.findMany({
      where: {
        date: {
          gte: fromVal,
          lte: toVal
        }
      },
      include: {
        machine: true
      }
    });

    const machineMap = new Map<string, any>();
    maintenances.forEach((m) => {
      const id = m.machineId;
      const dateKey = useDaily
      ? format(m.date, "yyyy-MM-dd") // e.g. 2025-07-03
      : `${m.date.getFullYear()}-${m.date.getMonth() + 1}`; // e.g. 2025-7

      const key = `${id}-${m.date.getFullYear()}-${m.date.getMonth() + 1}`;
      if (!machineMap.has(key)) {
        machineMap.set(key, {
          dataLabel: useDaily
          ? format(m.date, "dd MMM yyyy")
          : `${m.date.toLocaleString("default", {
              month: "long",
            })} ${m.date.getFullYear()}`,
          dateKey: dateKey,
          // month: `${m.date.toLocaleString('default', { month: 'long' })}`,
          // year: `${m.date.getFullYear()}`,
          section: m.machine.section,
          unit: m.machine.unit,
          machineCommonType: m.machine.machineCommonType,
          machineSpecificType: m.machine.machineSpecificType,
          machineGroup: m.machine.machineGroup,
          machineName: m.machine.name,
          machineStatus: m.machine.status,
          reportedDays: 1,
          // totalWorkingDays: 0 // placeholder
          totalWorkingDays: useDaily ? 1 : 22, // 1 day for daily, 22 fixed for monthly
        });
      } else {
        const row = machineMap.get(key)
        row.reportedDays++;
        if (useDaily) row.totalWorkingDays++;
      }
    });

    // Assume max 22 workdays per month for simplicity
    const summary = Array.from(machineMap.values()).map((row) => ({
      ...row,
      // totalWorkingDays: 22,
      percentage: `${((row.reportedDays / row.totalWorkingDays) * 100).toFixed(2)}%`
    }));

    res.json(summary);
  } catch (error) {
    console.error(error);
    throw {actualError: error, fallBackMessage: 'Failed to fetch monthly summary', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
};

export const getMonthlySummaryOnUnit = async (req: Request, res: Response) => {
  console.log("cek masuk getMonthlySummaryOnSection")
  try {
    const machines = await prisma.machine.findMany({
      select: { id: true, unit: true },
    });

    const unitGroups = new Map<string, string[]>(); // unit → machine IDs
    for (const machine of machines) {
      if (!unitGroups.has(machine.unit)) unitGroups.set(machine.unit, []);
      unitGroups.get(machine.unit)?.push(machine.id);
    }

    const maintenances = await prisma.dailyMaintenance.findMany({
      select: { machineId: true, dateOnly: true },
    });

    const totalWorkingDays = new Set(
      maintenances.map((m) => m.dateOnly.toISOString().split("T")[0])
    ).size;

    const reportedByMachine = new Map<string, number>();
    for (const m of maintenances) {
      reportedByMachine.set(m.machineId, (reportedByMachine.get(m.machineId) || 0) + 1);
    }

    const result = Array.from(unitGroups.entries()).map(([unit, machineIds]) => {
      const performances = machineIds.map((id) => {
        const reported = reportedByMachine.get(id) || 0;
        return reported / totalWorkingDays;
      });

      const avgPerformance =
        performances.reduce((sum, p) => sum + p, 0) / performances.length || 0;

      return {
        unit,
        machineCount: machineIds.length,
        performance: (avgPerformance * 100).toFixed(2),
      };
    });

    res.json({ data: result });
  } catch (err) {
    throw {
      actualError: err,
      fallBackMessage: "Failed to calculate accurate performance per unit",
      fallBackCode: 500,
    };
  }
}

export const getMonthlySummaryOnSection = async (req: Request, res: Response) => {
  console.log("cek masuk getMonthlySummaryOnSection")
  try {
    const machines = await prisma.machine.findMany({
      select: { id: true, section: true, unit: true  },
    });

    const sectionGroups = new Map<string, string[]>(); // section → machine IDs
    for (const machine of machines) {
      if (!sectionGroups.has(machine.section)) sectionGroups.set(machine.section, []);
      sectionGroups.get(machine.section)?.push(machine.id);
    }

    const maintenances = await prisma.dailyMaintenance.findMany({
      select: { machineId: true, dateOnly: true },
    });

    const totalWorkingDays = new Set(
      maintenances.map((m) => m.dateOnly.toISOString().split("T")[0])
    ).size;

    const reportedByMachine = new Map<string, number>();
    for (const m of maintenances) {
      reportedByMachine.set(m.machineId, (reportedByMachine.get(m.machineId) || 0) + 1);
    }

    const result = Array.from(sectionGroups.entries()).map(([section, machineIds]) => {
      const performances = machineIds.map((id) => {
        const reported = reportedByMachine.get(id) || 0;
        return reported / totalWorkingDays;
      });

      const avgPerformance =
        performances.reduce((sum, p) => sum + p, 0) / performances.length || 0;

      return {
        section,
        machineCount: machineIds.length,
        performance: (avgPerformance * 100).toFixed(2),
      };
    });

    res.json({ data: result });
  } catch (err) {
    throw {
      actualError: err,
      fallBackMessage: "Failed to calculate accurate performance per section",
      fallBackCode: 500,
    };
  }
}

export const uploadEvidence = async (req: Request, res: Response) => {
  const file = req.file;
  const questionId = req.body.questionId;
  console.log("cek file", file)
  console.log("cek questionId", questionId)

  if (!file || !questionId) {
    res.status(400).json({ error: "Missing file or question response ID" });
  }

  const extension = path.extname(file.originalname);
  const key = `evidence/${questionId}/${uuidv4()}${extension}`;

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    res.status(201).json({ url: publicUrl });
  } catch (error) {
    console.error("R2 Upload error:", error);
    res.status(500).json({ error: "Failed to upload file to R2" });
  }
}

export const getUnitMonthlySummary = async (req: Request, res: Response) => {
  // const year = Number(req.query.year);
  // const month = Number(req.query.month);
  // if (!year || !month) throw new CodeError("Missing year or month", 400);

  // const from = new Date(year, month - 1, 1);
  // const to = new Date(year, month, 0);
  const currentDate = new Date();
  const firstDateOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const lastDateOfYear = new Date(currentDate.getFullYear(), 11, 31);

  const machines = await prisma.machine.findMany({ select: { id: true, unit: true } });

  const unitGroups = new Map<string, string[]>();
  machines.forEach((m) => {
    if (!unitGroups.has(m.unit)) unitGroups.set(m.unit, []);
    unitGroups.get(m.unit)?.push(m.id);
  });

  const maintenances = await prisma.dailyMaintenance.findMany({
    where: { date: { gte: firstDateOfYear, lte: lastDateOfYear } },
    select: { machineId: true, dateOnly: true },
  });

  const reportedByMachine = new Map<string, number>();
  maintenances.forEach((m) => {
    reportedByMachine.set(m.machineId, (reportedByMachine.get(m.machineId) || 0) + 1);
  });

  const totalWorkdays = new Set(maintenances.map((m) => m.dateOnly.toISOString().split("T")[0])).size || 22;

  const result = Array.from(unitGroups.entries()).map(([unit, ids]) => {
    const avg =
      ids.reduce((acc, id) => acc + (reportedByMachine.get(id) || 0) / totalWorkdays, 0) / ids.length;

    return {
      unit,
      machineCount: ids.length,
      performance: Number((avg * 100).toFixed(2)), // %
    };
  });

  res.json({data: result});
};