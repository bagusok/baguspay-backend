/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethodId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `expired_at` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method_id` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_userId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "createdAt",
DROP COLUMN "paymentMethodId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_qrcode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_method_id" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
