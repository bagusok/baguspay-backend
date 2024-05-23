/*
  Warnings:

  - You are about to drop the column `tokens` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_tokens_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tokens";

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_history_id_key" ON "login_history"("id");

-- CreateIndex
CREATE UNIQUE INDEX "login_history_token_key" ON "login_history"("token");

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
