-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('WEB', 'MOBILE', 'API');

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "profit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "source_agent" TEXT,
ADD COLUMN     "source_type" "source_type" NOT NULL DEFAULT 'WEB';

-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN     "max_amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "min_amount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "profit_in_percent" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "profit_reseller_in_percent" TEXT NOT NULL DEFAULT '0';
