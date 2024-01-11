-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN     "cut_off_end" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "cut_off_start" TEXT NOT NULL DEFAULT '00:00';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cut_off_end" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "cut_off_start" TEXT NOT NULL DEFAULT '00:00';
