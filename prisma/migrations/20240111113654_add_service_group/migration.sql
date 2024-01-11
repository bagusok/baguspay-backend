-- AlterTable
ALTER TABLE "services" ADD COLUMN     "serviceGroupId" TEXT;

-- CreateTable
CREATE TABLE "service_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "img_logo" TEXT,
    "order_no" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_group_id_key" ON "service_group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "service_group_name_key" ON "service_group"("name");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_serviceGroupId_fkey" FOREIGN KEY ("serviceGroupId") REFERENCES "service_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
