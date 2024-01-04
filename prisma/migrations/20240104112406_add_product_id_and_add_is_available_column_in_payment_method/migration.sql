/*
  Warnings:

  - Added the required column `product_id` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true;
