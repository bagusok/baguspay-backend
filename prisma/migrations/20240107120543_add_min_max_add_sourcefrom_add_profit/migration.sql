/*
  Warnings:

  - You are about to drop the column `productCategoryId` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_productCategoryId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "productCategoryId",
ADD COLUMN     "productGroupId" TEXT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productGroupId_fkey" FOREIGN KEY ("productGroupId") REFERENCES "product_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
