-- CreateEnum
CREATE TYPE "MutationType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "balance_ref_type" AS ENUM ('DEPOSIT', 'WITHDRAW', 'TRANSACTION', 'REFUND', 'TRANSFER');

-- CreateTable
CREATE TABLE "balance_mutation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MutationType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "old_balance" INTEGER NOT NULL,
    "new_balance" INTEGER NOT NULL,
    "ref_type" "balance_ref_type" NOT NULL,
    "ref_id" TEXT,
    "user_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_mutation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "balance_mutation_id_key" ON "balance_mutation"("id");

-- AddForeignKey
ALTER TABLE "balance_mutation" ADD CONSTRAINT "balance_mutation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
