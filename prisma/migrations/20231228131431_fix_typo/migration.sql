/*
  Warnings:

  - You are about to drop the column `gamesId` on the `product_group` table. All the data in the column will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_productCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "product_group" DROP CONSTRAINT "product_group_gamesId_fkey";

-- AlterTable
ALTER TABLE "product_group" DROP COLUMN "gamesId",
ADD COLUMN     "servicesId" TEXT;

-- DropTable
DROP TABLE "product";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "img_logo" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "reseller_price" INTEGER NOT NULL,
    "type" "service_type" NOT NULL DEFAULT 'LAINNYA',
    "type_response" "ProductResponseType" NOT NULL DEFAULT 'DIRECT',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "h2h_provider" "provider_h2h",
    "id_product_provider" TEXT NOT NULL,
    "price_from_provider" INTEGER NOT NULL,
    "productCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "products"("id");

-- AddForeignKey
ALTER TABLE "product_group" ADD CONSTRAINT "product_group_servicesId_fkey" FOREIGN KEY ("servicesId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "product_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
