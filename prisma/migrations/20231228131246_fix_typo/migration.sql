/*
  Warnings:

  - You are about to drop the `product_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_productCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_gamesId_fkey";

-- DropTable
DROP TABLE "product_category";

-- CreateTable
CREATE TABLE "product_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "img_logo" TEXT,
    "region" "region" NOT NULL DEFAULT 'GLOBAL',
    "gamesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_group_id_key" ON "product_group"("id");

-- AddForeignKey
ALTER TABLE "product_group" ADD CONSTRAINT "product_group_gamesId_fkey" FOREIGN KEY ("gamesId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "product_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
