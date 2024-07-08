/*
  Warnings:

  - A unique constraint covering the columns `[inquiry_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "transaction_inquiry" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "inquiry_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_inquiry_id_key" ON "transactions"("inquiry_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "transaction_inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
