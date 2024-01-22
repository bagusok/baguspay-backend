-- CreateTable
CREATE TABLE "banner_slider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "link" TEXT,
    "order_no" SERIAL NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_slider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banner_slider_id_key" ON "banner_slider"("id");

-- CreateIndex
CREATE UNIQUE INDEX "banner_slider_name_key" ON "banner_slider"("name");
