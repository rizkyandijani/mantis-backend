import express from "express";
import cors from "cors";
import { postDailyMaintenance, protectedMaintenanceRouter, allDailyMaintenances, monthlyMaintenances, summaryMaintenance, maintenanceByStudent} from "./routes/maintenanceRoutes";
import { Role, Prisma } from '@prisma/client';
import {allMachines, machineById, machineByInventoryId, machineByType, protectedMachinerouter} from "./routes/machineRoutes";
import {loginRoute, usersByRole, protectedUserRouter, allInstructors} from "./routes/userRoutes";
import {allQuestion, allQuestionById, allQuestionByType, protectedQuestionRouter} from "./routes/questionRoutes";
import {authenticateJWT, authorizeRoles} from "./middleware/auth";
import {z} from "zod";
import { CodeError } from "./libs/code_error";
import { logger } from './utils/logger';
import { extractAssetDetailsFromHTML } from "./utils/common";


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/auth/validate-token', authenticateJWT, (req, res) => {
  res.status(200).json({ valid: true });
});

app.use('/api/login', loginRoute);

app.get('/api/fetch-proxy', async (req, res) => {
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
})

app.post('/api/maintenance', postDailyMaintenance);
app.get('/api/machine/byInventoryId/:inventoryId', machineByInventoryId);
app.get('/api/user/instructors', allInstructors);
app.get('/api/machine', allMachines);
app.get('/api/questionTemplate/byType/:machineType', allQuestionByType);

app.use('/api', authenticateJWT);

app.get('/api/questionTemplate', allQuestion);
app.get('/api/questionTemplate/:id', allQuestionById);

app.get('/api/maintenance/', allDailyMaintenances); // GET /api/maintenances
app.get('/api/maintenance/monthly', monthlyMaintenances); // GET /api/maintenances/monthly
app.get('/api/maintenance/summary', summaryMaintenance); // GET /api/maintenances/summaryMonthly
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