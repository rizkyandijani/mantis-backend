/*
  Warnings:

  - Added the required column `status` to the `DailyMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DailyMaintenanceStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "DailyMaintenance" DROP COLUMN "status",
ADD COLUMN     "status" "DailyMaintenanceStatus" NOT NULL;
