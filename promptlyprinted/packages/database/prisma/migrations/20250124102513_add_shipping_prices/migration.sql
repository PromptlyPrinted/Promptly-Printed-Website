-- CreateTable
CREATE TABLE "ShippingPrice" (
    "id" SERIAL NOT NULL,
    "method" "ShippingMethod" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "additionalItemPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingPrice_method_currency_key" ON "ShippingPrice"("method", "currency");
