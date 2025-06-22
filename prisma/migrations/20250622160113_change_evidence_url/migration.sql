/*
  Warnings:

  - You are about to drop the column `evidenceURL` on the `QuestionResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuestionResponse" DROP COLUMN "evidenceURL",
ADD COLUMN     "evidenceUrl" TEXT;
