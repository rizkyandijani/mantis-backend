import { Router } from 'express';
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineByType
} from '../controllers/machine';

const protectedMachinerouter = Router();

export const allMachines = getAllMachines;
export const machineById = getMachineById;
export const machineByType = getMachineByType;

protectedMachinerouter.post('/', createMachine);             // POST /machines
protectedMachinerouter.put('/:machineId', updateMachine);           // PUT /machines/:id
protectedMachinerouter.delete('/:machineId', deleteMachine);        // DELETE /machines/:id

export {protectedMachinerouter};
