/*
  Warnings:

  - You are about to drop the column `createdAt` on the `login_history` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `login_history` table. All the data in the column will be lost.
  - Added the required column `expired_at` to the `login_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `login_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "login_history" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
