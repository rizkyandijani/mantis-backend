import { z } from 'zod';
import { PrismaClient, MachineStatus, Role, DailyMaintenanceStatus } from '@prisma/client';

// const prisma = new PrismaClient();



export const createMachineSchema = z.object({
    machineCommonType: z.string().min(1, 'common type is required'),
    machineSpecificType: z.string().min(1, 'specific type is required'),
    machineGroup: z.string().min(1, 'machine group is required'),
    inventoryId: z.string().min(1, 'inventory Id is required'),
    section: z.string(),
    unit: z.string(),
    name: z.string().min(4, 'Name is required'),
    status: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
});

export const updateMachineSchema = z.object({
    machineCommonType: z.string().min(1, 'common type is required'),
    machineSpecificType: z.string().min(1, 'specific type is required'),
    machineGroup: z.string().min(1, 'machine group is required'),
    inventoryId: z.string().min(1, 'inventory Id is required'),
    section: z.string().min(4, 'section is required'),
    unit: z.string().min(4, 'work unit is required'),
    name: z.string().min(4, 'Name is required'),
    status: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
});

export const createMachineStatusLogSchema  = z.object({
    machineId: z.string().min(1, 'Machine ID is required'),
    changedById: z.string().min(1, 'Changed By ID is required'),
    oldStatus: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
    newStatus: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
})

export const updateMachineStatusLogSchema = z.object({
    comment: z.string().optional(),
    status: z.enum([MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE, MachineStatus.OUT_OF_SERVICE]).default(MachineStatus.OPERATIONAL),
});

export const createUserSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(4, 'Name is required'),
    role: z.enum([Role.admin, Role.instructor, Role.student]).default(Role.student),
})

export const updateUserSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(4, 'Name is required'),
    role: z.enum([Role.admin, Role.instructor, Role.student]).default(Role.student),
})

export const createDailyMaintenanceSchema = z.object({
    machineId: z.string().min(1, 'MachineId is required'),
    studentName: z.string().min(1, 'studentName is required'),
    studentId: z.string().min(1, 'studentId is required'),
    status: z.enum([DailyMaintenanceStatus.APPROVED, DailyMaintenanceStatus.PENDING, DailyMaintenanceStatus.REJECTED]).default(DailyMaintenanceStatus.PENDING),
    responses: z.array(z.object({
        questionId: z.string().min(1, 'QuestionId is required'),
        answer: z.string().min(1, 'Answer is required'),
    }))
})

export const updateDailyMaintenanceSchema = z.object({
    machineId: z.string().min(1, 'MachineId is required'),
    studentName: z.string().min(1, 'studentName is required'),
    studentId: z.string().min(1, 'studentId is required'),
    approvedById: z.string().min(1, 'ApprovedById is required'),
    approvalNote: z.string().min(1, 'ApprovalNote is required'),
    status: z.enum([DailyMaintenanceStatus.APPROVED, DailyMaintenanceStatus.PENDING, DailyMaintenanceStatus.REJECTED]).default(DailyMaintenanceStatus.PENDING),
    
})

export const createQuestionResponseSchema = z.object({
    dailyMaintenanceId: z.string().min(1, 'DailyMaintenanceId is required'),
    questionId: z.string().min(1, 'QuestionId is required'),
    answer: z.string().min(1, 'Answer is required'),
})

export const createQuestionTemplateSchema = z.object({
    machineCommonType: z.string().min(1, 'Question is required'),
    order: z.number().int().min(1, 'Order must be a positive integer'),
    isActive: z.boolean().default(true),
    question: z.string().min(1, 'Question is required'),
})

export const updateQuestionTemplateSchema = z.object({
    machineCommonType: z.string().min(1, 'Question is required'),
    order: z.number().int().min(1, 'Order must be a positive integer'),
    isActive: z.boolean().default(true),
    question: z.string().min(1, 'Question is required'),
})