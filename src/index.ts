import express from "express";
import cors from "cors";
import { postDailyMaintenance, protectedMaintenanceRouter, allDailyMaintenances, maintenanceByStudent, postEvidence} from "./routes/maintenanceRoutes";
import { Role, Prisma } from '@prisma/client';
import {allMachines, machineById, machineByInventoryId, machineByType, machineQRData, protectedMachinerouter} from "./routes/machineRoutes";
import {loginRoute, usersByRole, protectedUserRouter, allInstructors} from "./routes/userRoutes";
import {allQuestion, allQuestionById, allQuestionByType, protectedQuestionRouter} from "./routes/questionRoutes";
import {authenticateJWT, authorizeRoles} from "./middleware/auth";
import {z} from "zod";
import { CodeError } from "./libs/code_error";
import { logger } from './utils/logger';
import multer from 'multer';
import { getAllMachineType } from "./controllers/machine";


const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

app.use(cors());
app.use(express.json());

// Routes that can be accessed without token

app.get('/api/auth/validate-token', authenticateJWT, (req, res) => {
  res.status(200).json({ valid: true });
});

app.use('/api/login', loginRoute);



app.post('/api/maintenance', postDailyMaintenance);

app.get('/api/user/instructors', allInstructors);

app.get('/api/machine', allMachines);
app.get('/api/machine/byInventoryId/:inventoryId', machineByInventoryId);
app.get('/api/fetch-proxy', machineQRData)
app.get('/api/machine/allType', getAllMachineType);
 
app.get('/api/questionTemplate/byType/:machineType', allQuestionByType);
app.post('/api/evidence', upload.single('file'), postEvidence);

// Route that need JWT
app.use('/api', authenticateJWT);

app.get('/api/questionTemplate', allQuestion);
app.get('/api/questionTemplate/:id', allQuestionById);

app.get('/api/maintenance/', allDailyMaintenances); // GET /api/maintenances

// Route that needs roles authorization 
app.get('/api/maintenance/listing/by-student', authorizeRoles(Role.student), maintenanceByStudent); // GET /api/maintenances/student

app.use("/api/maintenance", authorizeRoles(Role.admin, Role.instructor), protectedMaintenanceRouter);

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
  logger.error(`[${req.method}] ${req.url} - ${err.actualError} |||| Whole error object => ${err}`);
  
  const error = err.actualError ?? err.fallBackMessage ?? err;
  const errorCode = err.fallBackCode ?? 500; // Default to 500 if not provided
  // Handle errors in a centralized way

    if(error instanceof z.ZodError){
      res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    if(error instanceof Prisma.PrismaClientKnownRequestError){
      res.status(Number(error.code) ?? 500).json({ error: (error.message ?? 'Failed to update machine status or log')});
      return;
    }
    if(typeof error === "string"){
      res.status(500).json({ error: error });
      return;
    }

    if (error instanceof CodeError) {
      res.status(error.code).json({ error: error.message });
      return;
    }

  res.status(errorCode);
  res.json({message: error});
});

export default app