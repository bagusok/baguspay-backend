/*
  Warnings:

  - A unique constraint covering the columns `[device_id]` on the table `login_history` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "login_history_device_id_key" ON "login_history"("device_id");
