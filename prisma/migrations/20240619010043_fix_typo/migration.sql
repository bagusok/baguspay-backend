/*
  Warnings:

  - The values [DiRECT_RETURN] on the enum `ProductResponseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductResponseType_new" AS ENUM ('DIRECT', 'DIRECT_RETURN', 'MANUAL');
ALTER TABLE "products" ALTER COLUMN "type_response" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "type_response" TYPE "ProductResponseType_new" USING ("type_response"::text::"ProductResponseType_new");
ALTER TYPE "ProductResponseType" RENAME TO "ProductResponseType_old";
ALTER TYPE "ProductResponseType_new" RENAME TO "ProductResponseType";
DROP TYPE "ProductResponseType_old";
ALTER TABLE "products" ALTER COLUMN "type_response" SET DEFAULT 'DIRECT';
COMMIT;
