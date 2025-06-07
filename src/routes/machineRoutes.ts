import { Router } from 'express';
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine
} from '../controllers/machine';

const router = Router();

router.get('/', getAllMachines);             // GET /machines
router.get('/:id', getMachineById);          // GET /machines/:id
router.post('/', createMachine);             // POST /machines
router.put('/:id', updateMachine);           // PUT /machines/:id
router.delete('/:id', deleteMachine);        // DELETE /machines/:id

export default router;
