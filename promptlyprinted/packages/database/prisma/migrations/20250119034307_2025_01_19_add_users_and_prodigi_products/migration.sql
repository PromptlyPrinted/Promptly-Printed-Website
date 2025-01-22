-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('BUDGET', 'STANDARD', 'EXPRESS', 'OVERNIGHT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "callbackUrl" TEXT,
ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "merchantReference" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "packingSlip" TEXT,
ADD COLUMN     "prodigiCreatedAt" TIMESTAMP(3),
ADD COLUMN     "prodigiLastUpdated" TIMESTAMP(3),
ADD COLUMN     "prodigiStage" TEXT,
ADD COLUMN     "prodigiStatusJson" JSONB,
ADD COLUMN     "shippingMethod" "ShippingMethod",
ADD COLUMN     "traceParent" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "assets" JSONB,
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "merchantReference" TEXT,
ADD COLUMN     "prodigiItemId" TEXT,
ADD COLUMN     "prodigiItemStatus" TEXT,
ADD COLUMN     "recipientCostAmount" DOUBLE PRECISION,
ADD COLUMN     "recipientCostCurrency" TEXT,
ADD COLUMN     "sizing" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "prodigiAttributes" JSONB,
ADD COLUMN     "prodigiDescription" TEXT,
ADD COLUMN     "prodigiPrintAreas" JSONB,
ADD COLUMN     "prodigiVariants" JSONB;

-- CreateTable
CREATE TABLE "Charge" (
    "id" SERIAL NOT NULL,
    "prodigiChargeId" TEXT,
    "chargeType" TEXT,
    "prodigiInvoiceNumber" TEXT,
    "costId" INTEGER,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeItem" (
    "id" SERIAL NOT NULL,
    "prodigiItemId" TEXT,
    "shipmentId" TEXT,
    "costId" INTEGER,
    "chargeId" INTEGER NOT NULL,

    CONSTRAINT "ChargeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" SERIAL NOT NULL,
    "amount" TEXT,
    "currency" TEXT,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "prodigiShipmentId" TEXT,
    "status" TEXT,
    "carrier" TEXT,
    "carrierService" TEXT,
    "trackingUrl" TEXT,
    "trackingNumber" TEXT,
    "dispatchDate" TIMESTAMP(3),
    "fulfillmentLocationId" INTEGER,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" SERIAL NOT NULL,
    "itemId" TEXT,
    "shipmentId" INTEGER NOT NULL,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentLocation" (
    "id" SERIAL NOT NULL,
    "countryCode" TEXT,
    "labCode" TEXT,

    CONSTRAINT "FulfillmentLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "shipmentMethod" "ShippingMethod",
    "costSummaryId" INTEGER,
    "issues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteCostSummary" (
    "id" SERIAL NOT NULL,
    "itemsCostId" INTEGER,
    "shippingCostId" INTEGER,

    CONSTRAINT "QuoteCostSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteShipment" (
    "id" SERIAL NOT NULL,
    "carrierName" TEXT,
    "carrierService" TEXT,
    "costId" INTEGER,
    "fulfillmentLocationId" INTEGER,
    "itemIds" JSONB,
    "quoteId" INTEGER NOT NULL,

    CONSTRAINT "QuoteShipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "itemId" TEXT,
    "sku" TEXT NOT NULL,
    "copies" INTEGER NOT NULL,
    "costId" INTEGER,
    "attributes" JSONB,
    "assets" JSONB,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdigiCallbackEvent" (
    "id" TEXT NOT NULL,
    "outcome" TEXT,
    "traceParent" TEXT,
    "eventId" TEXT,
    "specVersion" TEXT,
    "eventType" TEXT,
    "source" TEXT,
    "subject" TEXT,
    "dataContentType" TEXT,
    "occurredAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProdigiCallbackEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_costId_fkey" FOREIGN KEY ("costId") REFERENCES "Cost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeItem" ADD CONSTRAINT "ChargeItem_costId_fkey" FOREIGN KEY ("costId") REFERENCES "Cost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeItem" ADD CONSTRAINT "ChargeItem_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_fulfillmentLocationId_fkey" FOREIGN KEY ("fulfillmentLocationId") REFERENCES "FulfillmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_costSummaryId_fkey" FOREIGN KEY ("costSummaryId") REFERENCES "QuoteCostSummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteCostSummary" ADD CONSTRAINT "QuoteCostSummary_itemsCostId_fkey" FOREIGN KEY ("itemsCostId") REFERENCES "Cost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteCostSummary" ADD CONSTRAINT "QuoteCostSummary_shippingCostId_fkey" FOREIGN KEY ("shippingCostId") REFERENCES "Cost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteShipment" ADD CONSTRAINT "QuoteShipment_costId_fkey" FOREIGN KEY ("costId") REFERENCES "Cost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteShipment" ADD CONSTRAINT "QuoteShipment_fulfillmentLocationId_fkey" FOREIGN KEY ("fulfillmentLocationId") REFERENCES "FulfillmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteShipment" ADD CONSTRAINT "QuoteShipment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_costId_fkey" FOREIGN KEY ("costId") REFERENCES "Cost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
