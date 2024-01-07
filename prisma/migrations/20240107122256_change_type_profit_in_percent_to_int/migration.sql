/*
  Warnings:

  - The `profit_in_percent` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profit_reseller_in_percent` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "profit_in_percent",
ADD COLUMN     "profit_in_percent" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "profit_reseller_in_percent",
ADD COLUMN     "profit_reseller_in_percent" INTEGER NOT NULL DEFAULT 0;
