/*
  Warnings:

  - You are about to drop the column `studentEmail` on the `DailyMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `machineType` on the `QuestionTemplate` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `DailyMaintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentName` to the `DailyMaintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryId` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineCommonType` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineGroup` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineSpecificType` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineCommonType` to the `QuestionTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyMaintenance" DROP CONSTRAINT "DailyMaintenance_studentEmail_fkey";

-- AlterTable
ALTER TABLE "DailyMaintenance" DROP COLUMN "studentEmail",
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "studentName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Machine" DROP COLUMN "type",
ADD COLUMN     "inventoryId" TEXT NOT NULL,
ADD COLUMN     "machineCommonType" TEXT NOT NULL,
ADD COLUMN     "machineGroup" TEXT NOT NULL,
ADD COLUMN     "machineSpecificType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionTemplate" DROP COLUMN "machineType",
ADD COLUMN     "machineCommonType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "MachineType";
