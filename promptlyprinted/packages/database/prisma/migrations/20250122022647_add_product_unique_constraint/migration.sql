/*
  Warnings:

  - A unique constraint covering the columns `[sku,countryCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_countryCode_key" ON "Product"("sku", "countryCode");
