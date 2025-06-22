// controllers/machine.ts
import { Request, Response, response } from 'express';
import { z } from 'zod';
import { MachineStatus, PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import {CodeError} from '../libs/code_error';
import { updateMachineStatusLogSchema } from '../models/schema';
import {logger} from "../utils/logger"
import { extractAssetDetailsFromHTML } from '../utils/common';

const prisma = new PrismaClient();

export const getAllMachines = async (_req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch machines', fallBackCode: 500};
  }
};

export const getMachineByType = async (req: Request, res: Response) => {
  const { machineType } = req.params;
  try {
    const machine = await prisma.machine.findMany({
      where: { machineCommonType: machineType},
      orderBy: { id: 'asc' }
    });
    res.json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch machine by type', fallBackCode: 500};
  }
};

export const getAllMachineType = async (req: Request, res: Response) => {
  try {
    const machine = await prisma.machine.findMany({
      distinct: ['machineCommonType'],
      select: {
        machineCommonType: true
      },
      orderBy: { id: 'asc' },
    });
    const typeArray = machine.map(m => m.machineCommonType);
    res.json(typeArray);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch machine by type', fallBackCode: 500};
  }
};

export const getMachineById = async (req: Request, res: Response) => {
    const { machineId } = req.params;
    try {
      const machine = await prisma.machine.findUniqueOrThrow({
        where: { id: machineId },
        include: {statusLogs: true}
      });
      res.json(machine);
    } catch (error) {
      throw {actualError: error, fallBackMessage: 'Failed to fetch machine by id', fallBackCode: 500};
    }
  };

  export const getMachineByInventoryId = async (req: Request, res: Response) => {
    const { inventoryId } = req.params;
    console.log("cek inventoryId", inventoryId)
    try {
      const machine = await prisma.machine.findUnique({
        where: { inventoryId: inventoryId },
        include: {statusLogs: true}
      });
      console.log("cek machine", machine)
      if(!machine){
        throw new CodeError('Machine not found', 404);
      }
      res.json(machine);
    } catch (error) {
      throw {actualError: error, fallBackMessage: 'Failed to fetch machine by Inventory id', fallBackCode: 500};
    }
  };

export const createMachine = async (req: Request, res: Response) => {
  const { name, commonType, specificType, section, unit, machineGroup, inventoryId } = req.body;
  try {
    const machine = await prisma.machine.create({
        data: {
            inventoryId: inventoryId,
            name: name,
            machineCommonType: commonType,
            machineSpecificType: specificType,
            machineGroup: machineGroup,
            section: section,
            unit: unit
        },
    });
    res.status(201).json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to create machine', fallBackCode: 500};
  }
};

export const deleteMachine = async (req: Request, res: Response) => {
  const { machineId } = req.params;
  try {
    const deletedMachine = await prisma.machine.delete({
      where: { id: machineId }
    });
    res.status(204).send();
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to delete machine', fallBackCode: 500};
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  const {machineId} = req.params
  const { name, commonType, specificType, inventoryId, machineGroup, section, unit } = req.body;
  try {
    const machine = await prisma.machine.update({
      where: { id: machineId },
        data: {
            name: name,
            machineCommonType: commonType,
            machineSpecificType: specificType,
            inventoryId: inventoryId,
            machineGroup: machineGroup,
            section: section,
            unit: unit
        }
    });
    res.json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to update machine', fallBackCode: 500};
  }
};

export const createMachineStatusLog = async (req: AuthRequest, res: Response) => {
  const {machineId} = req.params
  const { status, comment } = req.body;
  const user = req.user;
  try {
    const machine = await prisma.machine.findUnique({
      where: {id: machineId}
    })
    if (!machine) {
      throw new CodeError('Machine not found', 404);
    }
    const machineLog = await prisma.machineStatusLog.create({
      data: {
        machineId: machineId,
        oldStatus: machine.status,
        newStatus: status,
        comment: comment ?? undefined, // Allow comment to be optional
        changedById: user.sub
      },
    })
    return machineLog;
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to create machine status log', fallBackCode: 500};
  }
}

export const updateMachineStatusLogs = async (req: AuthRequest, res: Response) => {
  const {machineId} = req.params
  const { status, comment } = req.body;
  try {
    req.body = updateMachineStatusLogSchema.parse({ status, comment });
    const logs = comment ? await createMachineStatusLog(req, res) : undefined;
    const machine = await prisma.machine.findUnique({
      where: {id: machineId}
    }).then(machine => {
      if (!machine)
        throw new CodeError('Machine not found', 404);
      
      return prisma.machine.update({
        where: { id: machineId },
        data: {
          status: status
        },
        include: { statusLogs: true }
      });
    })
    res.json(machine);
  } catch (error) {
    throw {actualError: error, fallBackMessage: 'Failed to update machine status or log', fallBackCode: 500};
  }
};

export const getMachineQRData = async (req : Request, res: Response) => {
  const targetUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url; // Ensure targetUrl is a string
  console.log("cek targetURL", targetUrl)
  if (typeof targetUrl !== 'string') {
     res.status(400).send('Invalid URL');
  }
  try {
    if(targetUrl){
      const response = await fetch(targetUrl as string);
      console.log("cek response fetch proxy", response)
      const text = await response.text(); // Use optional chaining
      console.log("cek text fetch proxy =>>", text)
      if(text){
        const assetDetails = extractAssetDetailsFromHTML(text);
        console.log("cek asset details", assetDetails);
        // You can do something with assetDetails here if needed
        res.status(200).json({data: assetDetails});
      }
      else{
        console.log("No text found in response");
        res.status(404).send('No content found');
      }
    }
    res.status(500).send('Failed to fetch target page');
  } catch (err) {
    console.log("err fetch proxy", err)
    res.status(500).send('Failed to fetch target page');
  }
}