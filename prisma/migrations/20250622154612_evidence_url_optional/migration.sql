/*
  Warnings:

  - You are about to drop the `EvidenceFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EvidenceFile" DROP CONSTRAINT "EvidenceFile_questionResponseId_fkey";

-- AlterTable
ALTER TABLE "QuestionResponse" ALTER COLUMN "evidenceURL" DROP NOT NULL;

-- DropTable
DROP TABLE "EvidenceFile";
