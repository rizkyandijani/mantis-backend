// controllers/machine.ts
import { Request, Response } from 'express';
import { MachineType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMachines = async (_req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machines', detail: error });
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
    res.status(500).json({ error: 'Failed to fetch machine by type', detail: error });
  }
};

export const getMachineById = async (req: Request, res: Response) => {
    const { machineId } = req.params;
    try {
      const machine = await prisma.machine.findUniqueOrThrow({
        where: { id: machineId }
      });
      res.json(machine);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch machine by id', detail: error });
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
    res.status(500).json({ error: `Failed to create machine`, detail: error });
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
    res.status(500).json({ error: 'Failed to delete machine', detail: error });
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
    res.status(500).json({ error: 'Failed to update machine', detail: error });
  }
};