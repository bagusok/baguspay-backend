/*
  Warnings:

  - A unique constraint covering the columns `[sub_name]` on the table `product_group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product_group" ADD COLUMN     "sub_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_group_sub_name_key" ON "product_group"("sub_name");
