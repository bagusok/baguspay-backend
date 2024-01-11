/*
  Warnings:

  - You are about to drop the column `serviceGroupId` on the `services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_serviceGroupId_fkey";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "serviceGroupId";

-- CreateTable
CREATE TABLE "_ServiceGroupToServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ServiceGroupToServices_AB_unique" ON "_ServiceGroupToServices"("A", "B");

-- CreateIndex
CREATE INDEX "_ServiceGroupToServices_B_index" ON "_ServiceGroupToServices"("B");

-- AddForeignKey
ALTER TABLE "_ServiceGroupToServices" ADD CONSTRAINT "_ServiceGroupToServices_A_fkey" FOREIGN KEY ("A") REFERENCES "service_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceGroupToServices" ADD CONSTRAINT "_ServiceGroupToServices_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
