-- CreateEnum
CREATE TYPE "payment_method_type" AS ENUM ('TRANSFER_BANK', 'TRANSFER_EWALLET', 'DIRECT_EWALLET', 'VIRTUAL_ACCOUNT', 'RETAIL_OUTLET', 'CREDIT_CARD', 'LINK_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethodProvider" AS ENUM ('PAYDISINI', 'DUITKU');

-- CreateTable
CREATE TABLE "payment_method" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider" "PaymentMethodProvider" NOT NULL,
    "type" "payment_method_type" NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "fees" INTEGER NOT NULL DEFAULT 0,
    "fees_in_percent" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_id_key" ON "payment_method"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_name_key" ON "payment_method"("name");
