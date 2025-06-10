-- AlterTable
ALTER TABLE "DailyMaintenance" ADD COLUMN     "approvalNote" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "status" TEXT;

-- AddForeignKey
ALTER TABLE "DailyMaintenance" ADD CONSTRAINT "DailyMaintenance_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
