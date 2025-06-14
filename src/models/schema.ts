import { z } from 'zod';
import { PrismaClient, MachineType, MachineStatus } from '@prisma/client';

// const prisma = new PrismaClient();



export const createMachineSchema = z.object({
    type: z.enum([MachineType.BUBUT, MachineType.FRAIS]), // Updated to use an array of enum values
    section: z.string(),
    unit: z.string(),
    name: z.string().min(4, 'Name is required'),
    status: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
});

export const updateMachineSchema = z.object({
    type: z.enum([MachineType.BUBUT, MachineType.FRAIS]), // Updated to use an array of enum values
    section: z.string().min(4, 'section is required'),
    unit: z.string().min(4, 'work unit is required'),
    name: z.string().min(4, 'Name is required'),
    status: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
});

export const updateMachineStatusLogSchema = z.object({
    comment: z.string().optional(),
    status: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
});
