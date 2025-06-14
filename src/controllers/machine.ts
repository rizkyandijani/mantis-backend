// controllers/machine.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { MachineStatus, MachineType, PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import {CodeError} from '../libs/code_error';
import { updateMachineStatusLogSchema } from '../models/schema';
import {logger} from "../utils/logger"

const prisma = new PrismaClient();

export const getAllMachines = async (_req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch machines', fallBackCode: 500};
  }
};

export const getMachineByType = async (req: Request, res: Response) => {
  const { machineType } = req.params;
  try {
    const machine = await prisma.machine.findMany({
      where: { type: machineType as MachineType },
      orderBy: { id: 'asc' }
    });
    res.json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch machine by type', fallBackCode: 500};
  }
};

export const getMachineById = async (req: Request, res: Response) => {
    const { machineId } = req.params;
    try {
      const machine = await prisma.machine.findUniqueOrThrow({
        where: { id: machineId },
        include: {statusLogs: true}
      });
      res.json(machine);
    } catch (error) {
      throw {actualError: error, fallBackMessage: 'Failed to fetch machine by id', fallBackCode: 500};
    }
  };

export const createMachine = async (req: Request, res: Response) => {
  const { name, type, section, unit  } = req.body;
  try {
    const machine = await prisma.machine.create({
        data: {
            name: name,
            type: type as MachineType,
            section: section,
            unit: unit
        },
    });
    res.status(201).json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to create machine', fallBackCode: 500};
  }
};

export const deleteMachine = async (req: Request, res: Response) => {
  const { machineId } = req.params;
  try {
    const deletedMachine = await prisma.machine.delete({
      where: { id: machineId }
    });
    res.status(204).send();
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to delete machine', fallBackCode: 500};
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  const {machineId} = req.params
  const { name, type, section, unit } = req.body;
  try {
    const machine = await prisma.machine.update({
      where: { id: machineId },
        data: {
            name: name,
            type: type as MachineType,
            section: section,
            unit: unit
        }
    });
    res.json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to update machine', fallBackCode: 500};
  }
};

export const createMachineStatusLog = async (req: AuthRequest, res: Response) => {
  const {machineId} = req.params
  const { status, comment } = req.body;
  const user = req.user;
  try {
    const machine = await prisma.machine.findUnique({
      where: {id: machineId}
    })
    if (!machine) {
      throw new CodeError('Machine not found', 404);
    }
    const machineLog = await prisma.machineStatusLog.create({
      data: {
        machineId: machineId,
        oldStatus: machine.status,
        newStatus: status,
        comment: comment ?? undefined, // Allow comment to be optional
        changedById: user.sub
      },
    })
    return machineLog;
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to create machine status log', fallBackCode: 500};
  }
}

export const updateMachineStatusLogs = async (req: AuthRequest, res: Response) => {
  const {machineId} = req.params
  const { status, comment } = req.body;
  try {
    req.body = updateMachineStatusLogSchema.parse({ status, comment });
    const logs = comment ? await createMachineStatusLog(req, res) : undefined;
    const machine = await prisma.machine.findUnique({
      where: {id: machineId}
    }).then(machine => {
      if (!machine)
        throw new CodeError('Machine not found', 404);
      
      return prisma.machine.update({
        where: { id: machineId },
        data: {
          status: status
        },
        include: { statusLogs: true }
      });
    })
    res.json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to update machine status or log', fallBackCode: 500};
  }
};