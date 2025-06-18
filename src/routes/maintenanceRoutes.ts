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
  approveOrRejectDailyMaintenance,
  getMaintenanceByStudent,
  getMonthlySummaryOnSection,
  getMonthlySummaryOnUnit
} from "../controllers/maintenance";
import { withAuth } from "../services/withAuth";

const protectedMaintenanceRouter = Router();

export const postDailyMaintenance = createDailyMaintenance;
export const allDailyMaintenances = getAllDailyMaintenances;
export const monthlyMaintenances = getMonthlyMaintenances;
export const summaryMaintenance = getMonthlySummary;
export const maintenanceByStudent = withAuth(getMaintenanceByStudent);

protectedMaintenanceRouter.get('/monthly', getMonthlyMaintenances); // GET /api/maintenances/monthly
protectedMaintenanceRouter.get('/summary', getMonthlySummary); // GET /api/maintenances/summaryMonthly
protectedMaintenanceRouter.get("/summary/sections", getMonthlySummaryOnSection);
protectedMaintenanceRouter.get("/summary/units", getMonthlySummaryOnUnit);

protectedMaintenanceRouter.get("/:maintenanceId", getDailyMaintenancesDetail);
protectedMaintenanceRouter.put("/:maintenanceId/updateStatus/", approveOrRejectDailyMaintenance);
protectedMaintenanceRouter.get("/status/:status/approver/:approverId", getDailyMaintenancesByStatus);
protectedMaintenanceRouter.get("/summary/machine/:machineId", getMonthlySummaryByMachine);
protectedMaintenanceRouter.get("/summary/section/:section", getMonthlySummaryBySection);



export {protectedMaintenanceRouter};
