/*
  Warnings:

  - A unique constraint covering the columns `[order_ref]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "order_ref" TEXT,
ADD COLUMN     "payment_ref" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_order_ref_key" ON "Transactions"("order_ref");
