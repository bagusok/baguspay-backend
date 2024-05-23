/*
  Warnings:

  - You are about to drop the column `is_link_payment` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN     "is_link_payment" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "is_link_payment";
