/*
  Warnings:

  - A unique constraint covering the columns `[sku_code]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - The required column `sku_code` was added to the `products` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sku_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_code_key" ON "products"("sku_code");
