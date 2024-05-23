-- CreateEnum
CREATE TYPE "deposit_status" AS ENUM ('PENDING', 'SUCCESS', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Deposit" (
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_id_key" ON "Deposit"("id");

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
