import { Router } from 'express';
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineByType,
  updateMachineStatusLogs
} from '../controllers/machine';
import { withAuth } from '../services/withAuth';

const protectedMachinerouter = Router();

export const allMachines = getAllMachines;
export const machineById = getMachineById;
export const machineByType = getMachineByType;

protectedMachinerouter.post('/', createMachine);             // POST /machines
protectedMachinerouter.put('/:machineId', updateMachine);           // PUT /machines/:id
protectedMachinerouter.put('/:machineId/log', withAuth(updateMachineStatusLogs));           // PUT /machines/:id/log
protectedMachinerouter.delete('/:machineId', deleteMachine);        // DELETE /machines/:id

export {protectedMachinerouter};
