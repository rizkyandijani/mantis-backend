/*
  Warnings:

  - Added the required column `evidenceURL` to the `QuestionResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionResponse" ADD COLUMN     "evidenceURL" TEXT NOT NULL;
