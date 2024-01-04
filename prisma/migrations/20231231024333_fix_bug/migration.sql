-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_payment_method_id_fkey";

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "payment_method_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
