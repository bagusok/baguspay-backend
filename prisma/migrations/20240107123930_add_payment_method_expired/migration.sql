-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN     "expired_in_minutes" INTEGER DEFAULT 30;
