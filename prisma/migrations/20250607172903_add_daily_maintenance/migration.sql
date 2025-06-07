-- CreateTable
CREATE TABLE "DailyMaintenance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "machineId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "DailyMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistResponse" (
    "id" SERIAL NOT NULL,
    "dailyMaintenanceId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "ChecklistResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistResponse" ADD CONSTRAINT "ChecklistResponse_dailyMaintenanceId_fkey" FOREIGN KEY ("dailyMaintenanceId") REFERENCES "DailyMaintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
