/*
  Warnings:

  - The `fees_in_percent` column on the `payment_method` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "payment_method" DROP COLUMN "fees_in_percent",
ADD COLUMN     "fees_in_percent" INTEGER NOT NULL DEFAULT 0;
