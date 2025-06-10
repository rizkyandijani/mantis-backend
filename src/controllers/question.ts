// controllers/Question.ts
import { Request, Response } from 'express';
import { MachineType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllQuestion = async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.questionTemplate.findMany({
      include: {machine: true},
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const getQuestionByType = async (req: Request, res: Response) => {
  const { machineType } = req.params;
  console.log("cek machineType", machineType)
  try {
    const templates = await prisma.questionTemplate.findMany({
      where: { machineType: machineType as MachineType },
      orderBy: { id: 'asc' },
      include: {machine: true},
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates by machine type' });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const template = await prisma.questionTemplate.findUniqueOrThrow({
        where: { id: id },
        include: {machine: true},
      });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template by id' });
    }
  };

export const createQuestion = async (req: Request, res: Response) => {
  const { machineType, question, order, isActive  } = req.params;
  try {
    const template = await prisma.questionTemplate.create({
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

export const deleteQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const template = await prisma.questionTemplate.delete({
      where: { id: id }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  const { id, machineType, question, order, isActive } = req.params;
  try {
    const template = await prisma.questionTemplate.update({
      where: { id: id },
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
