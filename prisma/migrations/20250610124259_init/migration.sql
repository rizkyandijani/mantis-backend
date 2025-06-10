/*
  Warnings:

  - A unique constraint covering the columns `[machineId,dateOnly]` on the table `DailyMaintenance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOnly` to the `DailyMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyMaintenance_machineId_date_key";

-- AlterTable
ALTER TABLE "DailyMaintenance" ADD COLUMN     "dateOnly" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DailyMaintenance_machineId_dateOnly_key" ON "DailyMaintenance"("machineId", "dateOnly");
