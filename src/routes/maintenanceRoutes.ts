import { Router } from "express";
import {
  createDailyMaintenance,
  getMonthlyMaintenances,
  getMonthlySummary,
  getMonthlySummaryByMachine,
  getMonthlySummaryBySection,
  getMonthlySummaryByUnit,
  getAllDailyMaintenances
} from "../controllers/maintenance";
import { get } from "http";

const protectedMaintenanceRouter = Router();

export const postDailyMaintenance = createDailyMaintenance;
export const allDailyMaintenances = getAllDailyMaintenances;
export const monthlyMaintenances = getMonthlyMaintenances;
export const summaryMaintenance = getMonthlySummary;

protectedMaintenanceRouter.get("/summary/machine/:machineId", getMonthlySummaryByMachine);
protectedMaintenanceRouter.get("/summary/section/:section", getMonthlySummaryBySection);
protectedMaintenanceRouter.get("/summary/unit/:unit", getMonthlySummaryByUnit);

export {protectedMaintenanceRouter};
