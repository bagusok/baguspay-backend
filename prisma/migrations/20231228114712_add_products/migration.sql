/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'USER', 'RESELLER');

-- CreateEnum
CREATE TYPE "service_type" AS ENUM ('GAME_DIRECT', 'GAME_VOUCHER', 'TAGIHAN', 'PULSA', 'PAKET_DATA', 'E_MONEY', 'AKUN_PREMIUM', 'SMM', 'LAINNYA');

-- CreateEnum
CREATE TYPE "input_field_type" AS ENUM ('TEXT', 'NUMBER', 'SELECT');

-- CreateEnum
CREATE TYPE "ProductResponseType" AS ENUM ('DIRECT', 'DiRECT_RETURN', 'MANUAL');

-- CreateEnum
CREATE TYPE "region" AS ENUM ('INDONESIA', 'MALAYSIA', 'SINGAPORE', 'GLOBAL');

-- CreateEnum
CREATE TYPE "provider_h2h" AS ENUM ('DIGIFLAZZ', 'VIPRESELLER', 'VOCAGAMES', 'APIGAMES');

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "tokens" TEXT,
    "role" "role" NOT NULL DEFAULT 'USER',
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_verif_email" BOOLEAN NOT NULL DEFAULT false,
    "is_verif_phone" BOOLEAN NOT NULL DEFAULT false,
    "otp_code" TEXT,
    "pin_code" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "point" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "desc" TEXT,
    "img_logo" TEXT,
    "img_banner" TEXT,
    "service_type" "service_type" NOT NULL DEFAULT 'LAINNYA',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "input_field_description" TEXT,
    "input_field_hint_image" TEXT,
    "is_input_field_one" BOOLEAN NOT NULL DEFAULT false,
    "input_field_one_type" "input_field_type" NOT NULL DEFAULT 'TEXT',
    "input_field_one_option" JSONB,
    "is_input_field_two" BOOLEAN NOT NULL DEFAULT false,
    "input_field_two_type" "input_field_type" NOT NULL DEFAULT 'TEXT',
    "input_field_two_option" JSONB,
    "is_input_field_three" BOOLEAN NOT NULL DEFAULT false,
    "input_field_three_type" "input_field_type" NOT NULL DEFAULT 'TEXT',
    "input_field_three_option" JSONB,
    "region" "region" NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "img_logo" TEXT,
    "region" "region" NOT NULL DEFAULT 'GLOBAL',
    "gamesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "img_logo" TEXT,
    "price" INTEGER NOT NULL,
    "reseller_price" INTEGER NOT NULL,
    "type" "service_type" NOT NULL DEFAULT 'LAINNYA',
    "type_response" "ProductResponseType" NOT NULL DEFAULT 'DIRECT',
    "isAvalable" BOOLEAN NOT NULL DEFAULT true,
    "h2h_provider" "provider_h2h",
    "id_product_provider" TEXT NOT NULL,
    "price_from_provider" INTEGER NOT NULL,
    "productCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_tokens_key" ON "users"("tokens");

-- CreateIndex
CREATE UNIQUE INDEX "services_id_key" ON "services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_id_key" ON "product_category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_id_key" ON "product"("id");

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_gamesId_fkey" FOREIGN KEY ("gamesId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "product_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
