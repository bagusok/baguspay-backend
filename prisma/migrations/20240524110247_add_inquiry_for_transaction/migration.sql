-- CreateEnum
CREATE TYPE "inquiry_provider" AS ENUM ('DIGIFLAZZ');

-- CreateTable
CREATE TABLE "transaction_inquiry" (
    "id" TEXT NOT NULL,
    "customer_number" TEXT NOT NULL,
    "customer_name" TEXT,
    "inquiry_type" TEXT NOT NULL DEFAULT 'OTHER',
    "inquiry_provider" "inquiry_provider" NOT NULL DEFAULT 'DIGIFLAZZ',
    "product_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "fees" INTEGER NOT NULL DEFAULT 0,
    "inquiry_data" JSONB NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "transaction_inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_inquiry_id_key" ON "transaction_inquiry"("id");

-- AddForeignKey
ALTER TABLE "transaction_inquiry" ADD CONSTRAINT "transaction_inquiry_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_inquiry" ADD CONSTRAINT "transaction_inquiry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
