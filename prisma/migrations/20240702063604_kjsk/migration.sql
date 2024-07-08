/*
  Warnings:

  - You are about to drop the `Deposit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `phone_number` to the `transaction_inquiry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_user_id_fkey";

-- AlterTable
ALTER TABLE "transaction_inquiry" ADD COLUMN     "phone_number" TEXT NOT NULL;

-- DropTable
DROP TABLE "Deposit";

-- CreateTable
CREATE TABLE "deposit" (
    "id" TEXT NOT NULL,
    "payment_ref" TEXT,
    "id_payment_provider" TEXT,
    "payment_number" TEXT,
    "payment_name" TEXT,
    "is_link_payment" BOOLEAN NOT NULL DEFAULT false,
    "link_payment" TEXT,
    "is_qrcode" BOOLEAN NOT NULL DEFAULT false,
    "qr_data" TEXT,
    "deposit_status" "deposit_status" NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT NOT NULL,
    "payment_method_id" TEXT,
    "payment_method_type" "payment_method_type" NOT NULL,
    "source" TEXT,
    "source_agent" TEXT,
    "source_type" "source_type" NOT NULL DEFAULT 'WEB',
    "notes" TEXT,
    "amount" INTEGER NOT NULL,
    "fees" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deposit_id_key" ON "deposit"("id");

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
