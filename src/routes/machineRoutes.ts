import { Router } from 'express';
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineByType,
  updateMachineStatusLogs,
  getMachineByInventoryId,
  getMachineQRData,
  getAllMachineType
} from '../controllers/machine';
import { withAuth } from '../services/withAuth';

const protectedMachinerouter = Router();

export const allMachines = getAllMachines;
export const machineById = getMachineById;
export const machineByType = getMachineByType;
export const machineByInventoryId = getMachineByInventoryId
export const machineQRData = getMachineQRData;
export const allMachineType = getAllMachineType;

protectedMachinerouter.post('/', createMachine);             // POST /machines
protectedMachinerouter.put('/:machineId', updateMachine);           // PUT /machines/:id
protectedMachinerouter.put('/:machineId/log', withAuth(updateMachineStatusLogs));           // PUT /machines/:id/log
protectedMachinerouter.delete('/:machineId', deleteMachine);        // DELETE /machines/:id

export {protectedMachinerouter};
