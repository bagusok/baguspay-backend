-- AlterTable
ALTER TABLE "products" ADD COLUMN     "profit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profit_reseller" INTEGER NOT NULL DEFAULT 0;
