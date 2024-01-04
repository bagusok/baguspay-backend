-- CreateEnum
CREATE TYPE "paid_status" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'PROCESS', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "refund_status" AS ENUM ('NONE', 'PENDING', 'PROCESS', 'SUCCESS', 'FAILED');

-- AlterEnum
ALTER TYPE "payment_method_type" ADD VALUE 'QR_CODE';

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_service" TEXT NOT NULL,
    "product_price" INTEGER NOT NULL,
    "product_qty" INTEGER NOT NULL DEFAULT 1,
    "total_price" INTEGER NOT NULL,
    "fees" INTEGER NOT NULL DEFAULT 0,
    "id_payment_provider" TEXT,
    "payment_number" TEXT,
    "payment_name" TEXT,
    "is_link_payment" BOOLEAN NOT NULL DEFAULT false,
    "link_payment" TEXT,
    "qr_data" TEXT,
    "paid_status" "paid_status" NOT NULL DEFAULT 'PENDING',
    "order_status" "order_status" NOT NULL DEFAULT 'PENDING',
    "is_refund" BOOLEAN NOT NULL DEFAULT false,
    "refund_status" "refund_status" NOT NULL DEFAULT 'NONE',
    "userId" TEXT,
    "paymentMethodId" TEXT NOT NULL,
    "payment_method_type" "payment_method_type" NOT NULL,
    "paid_at" TIMESTAMP(3),
    "send_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_id_key" ON "Transactions"("id");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
