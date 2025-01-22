/*
  Warnings:

  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `edge` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCost` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `units` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "color" TEXT[],
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "edge" TEXT NOT NULL,
ADD COLUMN     "fulfillmentCountryCode" TEXT,
ADD COLUMN     "fulfillmentLabCode" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "size" TEXT[],
ADD COLUMN     "style" TEXT NOT NULL,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "units" TEXT NOT NULL,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL;
