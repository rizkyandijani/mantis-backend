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

const router = Router();

router.post("/", createDailyMaintenance);
router.get("/", getAllDailyMaintenances)
router.get("/monthly", getMonthlyMaintenances);
router.get("/summary", getMonthlySummary);
router.get("/summary/machine/:machineId", getMonthlySummaryByMachine);
router.get("/summary/section/:section", getMonthlySummaryBySection);
router.get("/summary/unit/:unit", getMonthlySummaryByUnit);

export default router;
