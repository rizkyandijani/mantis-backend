/*
  Warnings:

  - Added the required column `machineType` to the `ChecklistTemplate` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Machine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ChecklistTemplate" DROP CONSTRAINT "ChecklistTemplate_machineId_fkey";

-- AlterTable
ALTER TABLE "ChecklistTemplate" ADD COLUMN     "machineType" "MachineType" NOT NULL,
ALTER COLUMN "machineId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Machine" DROP COLUMN "type",
ADD COLUMN     "type" "MachineType" NOT NULL;

-- AddForeignKey
ALTER TABLE "ChecklistTemplate" ADD CONSTRAINT "ChecklistTemplate_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
