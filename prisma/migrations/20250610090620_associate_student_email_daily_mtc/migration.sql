/*
  Warnings:

  - You are about to drop the column `studentId` on the `DailyMaintenance` table. All the data in the column will be lost.
  - Added the required column `studentEmail` to the `DailyMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyMaintenance" DROP CONSTRAINT "DailyMaintenance_studentId_fkey";

-- AlterTable
ALTER TABLE "DailyMaintenance" DROP COLUMN "studentId",
ADD COLUMN     "studentEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_studentEmail_fkey" FOREIGN KEY ("studentEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
