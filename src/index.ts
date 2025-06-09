import express from "express";
import cors from "cors";
import maintenanceRoutes from "./routes/maintenanceRoutes";
import machineRoutes from "./routes/machineRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/machine", machineRoutes);
app.use("/api/checklistTemplate", checklistRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("MANTIS API is running");
});

export default app