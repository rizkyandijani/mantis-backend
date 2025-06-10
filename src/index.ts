import express from "express";
import cors from "cors";
import { postDailyMaintenance, protectedMaintenanceRouter, allDailyMaintenances, monthlyMaintenances, summaryMaintenance} from "./routes/maintenanceRoutes";
import { Role } from '@prisma/client';
import {allMachines, machineById, machineByType, protectedMachinerouter} from "./routes/machineRoutes";
import {loginRoute, protectedUserRouter} from "./routes/userRoutes";
import {allQuestion, allQuestionById, allQuestionByType, protectedQuestionRouter} from "./routes/questionRoutes";
import {authenticateJWT, authorizeRoles} from "./middleware/auth";


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRoute);

app.use('/api', authenticateJWT);

app.get('/api/questionTemplate', allQuestion);
app.get('/api/questionTemplate/:id', allQuestionById);
app.get('/api/questionTemplate/byType/:machineType', allQuestionByType);

app.post('/api/maintenance', authorizeRoles(Role.admin, Role.instructor, Role.student), postDailyMaintenance); // POST /api/maintenance
app.get('/api/maintenance/', allDailyMaintenances); // GET /api/maintenances
app.get('/api/maintenance/monthly', monthlyMaintenances); // GET /api/maintenances/monthly
app.get('/api/maintenance/summary', summaryMaintenance); // GET /api/maintenances/summaryMonthly

app.use("/api/maintenance", authorizeRoles(Role.admin, Role.instructor), protectedMaintenanceRouter);

app.get('/api/machine', allMachines);
app.get('/api/machine/:machineId', machineById);
app.get('/api/machine/:machineType', machineByType);

app.use("/api/machine", authorizeRoles(Role.admin, Role.instructor), protectedMachinerouter);
app.use("/api/questionTemplate", authorizeRoles(Role.admin, Role.instructor), protectedQuestionRouter);
app.use("/api/user", authorizeRoles(Role.admin, Role.instructor), protectedUserRouter);

app.get("/", (req, res) => {
  res.send("MANTIS API is running");
});

export default app