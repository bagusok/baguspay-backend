-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'RESELLER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "tokens" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_verif_email" BOOLEAN NOT NULL DEFAULT false,
    "is_verif_phone" BOOLEAN NOT NULL DEFAULT false,
    "otp_code" TEXT,
    "pin_code" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "point" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_tokens_key" ON "User"("tokens");
