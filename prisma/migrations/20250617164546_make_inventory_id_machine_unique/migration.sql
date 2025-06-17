/*
  Warnings:

  - A unique constraint covering the columns `[inventoryId]` on the table `Machine` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Machine_inventoryId_key" ON "Machine"("inventoryId");
