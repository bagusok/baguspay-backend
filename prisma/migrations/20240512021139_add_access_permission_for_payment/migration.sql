-- CreateEnum
CREATE TYPE "PaymentAllowAccess" AS ENUM ('DEPOSIT', 'TRANSACTION');

-- AlterTable
ALTER TABLE "payment_method" ADD COLUMN     "payment_allow_access" "PaymentAllowAccess"[];
