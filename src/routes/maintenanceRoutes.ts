import { Router } from "express";
import {
  createDailyMaintenance,
  getMonthlyMaintenances,
  getMonthlySummary,
  getMonthlySummaryByMachine,
  getMonthlySummaryBySection,
  getMonthlySummaryByUnit,
  getAllDailyMaintenances,
  getDailyMaintenancesByStatus,
  getDailyMaintenancesDetail,
  approveOrRejectDailyMaintenance
} from "../controllers/maintenance";

const protectedMaintenanceRouter = Router();

export const postDailyMaintenance = createDailyMaintenance;
export const allDailyMaintenances = getAllDailyMaintenances;
export const monthlyMaintenances = getMonthlyMaintenances;
export const summaryMaintenance = getMonthlySummary;

console.log("cek masuk route maintenance")

protectedMaintenanceRouter.get("/:maintenanceId", getDailyMaintenancesDetail);
protectedMaintenanceRouter.put("/:maintenanceId/updateStatus/", approveOrRejectDailyMaintenance);
protectedMaintenanceRouter.get("/status/:status/approver/:approverId", getDailyMaintenancesByStatus);
protectedMaintenanceRouter.get("/summary/machine/:machineId", getMonthlySummaryByMachine);
protectedMaintenanceRouter.get("/summary/section/:section", getMonthlySummaryBySection);
protectedMaintenanceRouter.get("/summary/unit/:unit", getMonthlySummaryByUnit);

export {protectedMaintenanceRouter};
