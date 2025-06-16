import { Router } from 'express';
import {
  getAllQuestion,
  getQuestionById,
  getQuestionByType,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/question';

const protectedQuestionRouter = Router();

export const allQuestion = getAllQuestion;
export const allQuestionById = getQuestionById;
export const allQuestionByType = getQuestionByType;

protectedQuestionRouter.post('/', createQuestion);              // POST /QuestionTemplate
protectedQuestionRouter.put('/:id', updateQuestion);            // PUT /QuestionTemplate/:id
protectedQuestionRouter.delete('/:id', deleteQuestion);         // DELETE /QuestionTemplate/:id

export {protectedQuestionRouter};
