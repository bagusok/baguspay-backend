/*
  Warnings:

  - Added the required column `amount` to the `Deposit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "fees" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payment_method" ALTER COLUMN "payment_allow_access" SET DEFAULT ARRAY['DEPOSIT', 'TRANSACTION']::"PaymentAllowAccess"[];
