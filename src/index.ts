import express from "express";
import cors from "cors";
import maintenanceRoutes from "./routes/maintenanceRoutes";
import machineRoutes from "./routes/machineRoutes";
import checklistRoutes from "./routes/checklistRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/machine", machineRoutes);
app.use("/api/checklistTemplate", checklistRoutes);

app.get("/", (req, res) => {
  res.send("MANTIS API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
