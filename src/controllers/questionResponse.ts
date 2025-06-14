// controllers/checklist.ts
import { Request, Response } from 'express';
import { QuestionTemplate, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllQuestionResponse = async (_req: Request, res: Response) => {
  try {
    const questionResponse = await prisma.questionResponse.findMany({
      include: {dailyMaintenance: true},
    });
    res.json(questionResponse);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch questionResponses', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch questionResponses' });
  }
};

export const createQuestionResponse = async (req: Request, res: Response) => {
    const { dailyMaintenanceId, questionId, answer  } = req.params;
    try {
      const questionResponse = await prisma.questionResponse.create({
          data: {
            dailyMaintenanceId: dailyMaintenanceId,
            questionId: questionId,
            answer: answer === "true" // Convert string to boolean
          },
      });
      res.json(questionResponse);
    } catch (error) {
      throw {actualError: error, fallBackMessage: 'Failed to create checklist response', fallBackCode: 500};
      // res.status(500).json({ error: 'Failed to create checklist response' });
    }
  };