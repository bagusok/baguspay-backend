-- AlterTable
ALTER TABLE "payment_method" ALTER COLUMN "fees_in_percent" SET DEFAULT '0',
ALTER COLUMN "fees_in_percent" SET DATA TYPE TEXT;
