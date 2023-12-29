/*
  Warnings:

  - You are about to drop the column `isAvalable` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "isAvalable",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
