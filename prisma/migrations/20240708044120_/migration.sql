/*
  Warnings:

  - The values [CANCELLED] on the enum `deposit_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELLED] on the enum `order_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELLED] on the enum `paid_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "deposit_status_new" AS ENUM ('PENDING', 'PROCESS', 'SUCCESS', 'CANCELED', 'EXPIRED');
ALTER TABLE "deposit" ALTER COLUMN "deposit_status" DROP DEFAULT;
ALTER TABLE "deposit" ALTER COLUMN "deposit_status" TYPE "deposit_status_new" USING ("deposit_status"::text::"deposit_status_new");
ALTER TYPE "deposit_status" RENAME TO "deposit_status_old";
ALTER TYPE "deposit_status_new" RENAME TO "deposit_status";
DROP TYPE "deposit_status_old";
ALTER TABLE "deposit" ALTER COLUMN "deposit_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "order_status_new" AS ENUM ('PENDING', 'PROCESS', 'SUCCESS', 'FAILED', 'CANCELED');
ALTER TABLE "transaction_inquiry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "order_status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "order_status" TYPE "order_status_new" USING ("order_status"::text::"order_status_new");
ALTER TABLE "transaction_inquiry" ALTER COLUMN "status" TYPE "order_status_new" USING ("status"::text::"order_status_new");
ALTER TYPE "order_status" RENAME TO "order_status_old";
ALTER TYPE "order_status_new" RENAME TO "order_status";
DROP TYPE "order_status_old";
ALTER TABLE "transaction_inquiry" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "transactions" ALTER COLUMN "order_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "paid_status_new" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'EXPIRED');
ALTER TABLE "transactions" ALTER COLUMN "paid_status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "paid_status" TYPE "paid_status_new" USING ("paid_status"::text::"paid_status_new");
ALTER TYPE "paid_status" RENAME TO "paid_status_old";
ALTER TYPE "paid_status_new" RENAME TO "paid_status";
DROP TYPE "paid_status_old";
ALTER TABLE "transactions" ALTER COLUMN "paid_status" SET DEFAULT 'PENDING';
COMMIT;
