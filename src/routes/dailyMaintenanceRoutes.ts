import { Router } from "express";
import {
  createDailyMaintenance,
  getDailyMaintenances,
  getMonthlySummary,
  getMonthlySummaryByMachine,
  getMonthlySummaryBySection,
  getMonthlySummaryByUnit,
} from "../controllers/dailyMaintenanceControllers";

const router = Router();

router.post("/", createDailyMaintenance);
router.get("/", getDailyMaintenances);
router.get("/summary", getMonthlySummary);
router.get("/summary/machine/:machineId", getMonthlySummaryByMachine);
router.get("/summary/section/:section", getMonthlySummaryBySection);
router.get("/summary/unit/:unit", getMonthlySummaryByUnit);

export default router;
