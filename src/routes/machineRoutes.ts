import { Router } from 'express';
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineByType
} from '../controllers/machine';

const router = Router();

router.get('/', getAllMachines);             // GET /machines
router.get('/:machineId', getMachineById);          // GET /machines/:id
router.get('/type/:machineType', getMachineByType); // GET /machines/type/:machineType
router.post('/', createMachine);             // POST /machines
router.put('/:machineId', updateMachine);           // PUT /machines/:id
router.delete('/:machineId', deleteMachine);        // DELETE /machines/:id

export default router;
