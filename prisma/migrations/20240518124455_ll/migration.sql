/*
  Warnings:

  - You are about to drop the `Transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_user_id_fkey";

-- DropTable
DROP TABLE "Transactions";

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "order_ref" TEXT,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_service" TEXT NOT NULL,
    "product_price" INTEGER NOT NULL,
    "product_qty" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "fees" INTEGER NOT NULL DEFAULT 0,
    "profit" INTEGER NOT NULL DEFAULT 0,
    "total_price" INTEGER NOT NULL,
    "payment_ref" TEXT,
    "id_payment_provider" TEXT,
    "payment_number" TEXT,
    "payment_name" TEXT,
    "is_link_payment" BOOLEAN NOT NULL DEFAULT false,
    "link_payment" TEXT,
    "is_qrcode" BOOLEAN NOT NULL DEFAULT false,
    "qr_data" TEXT,
    "paid_status" "paid_status" NOT NULL DEFAULT 'PENDING',
    "order_status" "order_status" NOT NULL DEFAULT 'PENDING',
    "is_refund" BOOLEAN NOT NULL DEFAULT false,
    "refund_status" "refund_status" NOT NULL DEFAULT 'NONE',
    "user_id" TEXT,
    "payment_method_id" TEXT,
    "payment_method_type" "payment_method_type" NOT NULL,
    "paid_at" TIMESTAMP(3),
    "send_at" TIMESTAMP(3),
    "source" TEXT,
    "source_agent" TEXT,
    "source_type" "source_type" NOT NULL DEFAULT 'WEB',
    "sn_ref" TEXT,
    "notes" TEXT,
    "input_data" TEXT,
    "output_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_id_key" ON "transactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_order_ref_key" ON "transactions"("order_ref");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
