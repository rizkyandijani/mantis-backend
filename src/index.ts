import express from "express";
import cors from "cors";
import { postDailyMaintenance, protectedMaintenanceRouter, allDailyMaintenances, monthlyMaintenances, summaryMaintenance, maintenanceByStudent} from "./routes/maintenanceRoutes";
import { Role, Prisma } from '@prisma/client';
import {allMachines, machineById, machineByType, protectedMachinerouter} from "./routes/machineRoutes";
import {loginRoute, usersByRole, protectedUserRouter} from "./routes/userRoutes";
import {allQuestion, allQuestionById, allQuestionByType, protectedQuestionRouter} from "./routes/questionRoutes";
import {authenticateJWT, authorizeRoles} from "./middleware/auth";
import {z} from "zod";
import { CodeError } from "./libs/code_error";
import { logger } from './utils/logger';


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/auth/validate-token', authenticateJWT, (req, res) => {
  res.status(200).json({ valid: true });
});

app.use('/api/login', loginRoute);

app.use('/api', authenticateJWT);

app.get('/api/questionTemplate', allQuestion);
app.get('/api/questionTemplate/:id', allQuestionById);
app.get('/api/questionTemplate/byType/:machineType', allQuestionByType);

app.post('/api/maintenance', authorizeRoles(Role.admin, Role.instructor, Role.student), postDailyMaintenance); // POST /api/maintenance
app.get('/api/maintenance/', allDailyMaintenances); // GET /api/maintenances
app.get('/api/maintenance/monthly', monthlyMaintenances); // GET /api/maintenances/monthly
app.get('/api/maintenance/summary', summaryMaintenance); // GET /api/maintenances/summaryMonthly
app.get('/api/maintenance/listing/by-student', authorizeRoles(Role.student), maintenanceByStudent); // GET /api/maintenances/student

app.use("/api/maintenance", authorizeRoles(Role.admin, Role.instructor), protectedMaintenanceRouter);

app.get('/api/machine', allMachines);
app.get('/api/machine/byId/:machineId', machineById);
app.get('/api/machine/byType/:machineType', machineByType);

app.use("/api/machine", authorizeRoles(Role.admin, Role.instructor), protectedMachinerouter);
app.use("/api/questionTemplate", authorizeRoles(Role.admin, Role.instructor), protectedQuestionRouter);

app.get('/api/user/role/:role', authorizeRoles(Role.admin, Role.instructor, Role.student), usersByRole);

app.use("/api/user", authorizeRoles(Role.admin, Role.instructor), protectedUserRouter);

app.get("/", (req, res) => {
  res.send("MANTIS API is running");
});

app.use(function(err: {actualError: any, fallBackMessage: string, fallBackCode: number}, req: express.Request, res: express.Response, next: express.NextFunction): void {
  console.log('cek err index', err)
  logger.error(`[${req.method}] ${req.url} - ${err.actualError}`);
  
  const error = err.actualError ?? err.fallBackMessage;
  const errorCode = err.fallBackCode ?? 500; // Default to 500 if not provided
  // Handle errors in a centralized way

    if(error instanceof z.ZodError){
      console.log("cek masuk")
      res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    if(error instanceof Prisma.PrismaClientKnownRequestError){
      res.status(Number(error.code) ?? 500).json({ error: (error.message ?? 'Failed to update machine status or log')});
    }
    if(typeof error === "string"){
      res.status(500).json({ error: error });
    }

    if (error instanceof CodeError) {
      res.status(error.code).json({ error: error.message });
    }

  res.status(errorCode);
  res.json({message: error});
});

export default app