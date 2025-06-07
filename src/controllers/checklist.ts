// controllers/checklist.ts
import { Request, Response } from 'express';
import { MachineType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllChecklist = async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.checklistTemplate.findMany();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const getChecklistByType = async (req: Request, res: Response) => {
  const { machineType } = req.params;
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { machineType: machineType as MachineType },
      orderBy: { id: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates by machine type' });
  }
};

export const getChecklistById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const template = await prisma.checklistTemplate.findUniqueOrThrow({
        where: { id: parseInt(id) }
      });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template by id' });
    }
  };

export const createChecklist = async (req: Request, res: Response) => {
  const { machineType, question, order, isActive  } = req.params;
  try {
    const template = await prisma.checklistTemplate.create({
        data: {
            machineType: machineType as MachineType,
            question: question,
            order: parseInt(order),
            isActive: isActive === 'true' // Convert string to boolean
        },
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
};

export const deleteChecklist = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const template = await prisma.checklistTemplate.delete({
      where: { id: parseInt(id) }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

export const updateChecklist = async (req: Request, res: Response) => {
  const { id, machineType, question, order, isActive } = req.params;
  try {
    const template = await prisma.checklistTemplate.update({
      where: { id: parseInt(id) },
        data: {
            question: question,
            machineType: machineType as MachineType,
            order: parseInt(order),
            isActive: isActive === 'true' // Convert string to boolean
        }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template' });
  }
};
