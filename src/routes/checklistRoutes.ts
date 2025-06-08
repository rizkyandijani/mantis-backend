import { Router } from 'express';
import {
  getAllChecklist,
  getChecklistById,
  getChecklistByType,
  createChecklist,
  updateChecklist,
  deleteChecklist
} from '../controllers/checklist';

const router = Router();

router.get('/', getAllChecklist);             // GET /checklistTemplate
router.get('/:id', getChecklistById);          // GET /checklistTemplate/:id
router.get('/byType/:machineType', getChecklistByType);          // GET /checklistTemplate/:id
router.post('/', createChecklist);             // POST /checklistTemplate
router.put('/:id', updateChecklist);           // PUT /checklistTemplate/:id
router.delete('/:id', deleteChecklist);        // DELETE /checklistTemplate/:id

export default router;
