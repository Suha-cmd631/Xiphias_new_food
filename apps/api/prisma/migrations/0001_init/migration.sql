-- Xiphias Superfoods — initial schema (hand-reviewed; mirrors prisma/schema.prisma)
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'active', 'archived');
CREATE TYPE "Gateway" AS ENUM ('jiopay', 'stripe', 'mock');
CREATE TYPE "TaxMode" AS ENUM ('inclusive', 'exclusive', 'dap');
CREATE TYPE "CouponType" AS ENUM ('percent', 'fixed', 'free_shipping');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE "PaymentStatus" AS ENUM ('initiated', 'pending', 'paid', 'failed', 'refunded');
CREATE TYPE "FulfillmentStatus" AS ENUM ('unfulfilled', 'partial', 'fulfilled');

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "image" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "subtitle" TEXT, "description" TEXT NOT NULL DEFAULT '',
  "bodySections" JSONB NOT NULL DEFAULT '[]', "categoryId" TEXT NOT NULL, "status" "ProductStatus" NOT NULL DEFAULT 'active',
  "originDistrict" TEXT, "originCountry" TEXT NOT NULL DEFAULT 'IN', "hsCode" TEXT, "shelfLifeDays" INTEGER,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[], "diet" TEXT[] DEFAULT ARRAY[]::TEXT[], "badge" TEXT,
  "isBestseller" BOOLEAN NOT NULL DEFAULT false, "isNew" BOOLEAN NOT NULL DEFAULT false, "availableIn" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 5, "reviewCount" INTEGER NOT NULL DEFAULT 0, "seoTitle" TEXT, "seoDescription" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_status_idx" ON "Product"("categoryId", "status");

CREATE TABLE "ProductImage" (
  "id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL, "url" TEXT NOT NULL, "alt" TEXT NOT NULL DEFAULT '', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Variant" (
  "id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL, "sku" TEXT NOT NULL, "title" TEXT NOT NULL, "weightGrams" INTEGER NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0, "trackInventory" BOOLEAN NOT NULL DEFAULT true, "lowStockAt" INTEGER NOT NULL DEFAULT 5,
  CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Variant_sku_key" ON "Variant"("sku");

CREATE TABLE "PriceList" ("id" TEXT PRIMARY KEY, "code" TEXT NOT NULL, "currency" TEXT NOT NULL, "taxInclusive" BOOLEAN NOT NULL DEFAULT true);
CREATE UNIQUE INDEX "PriceList_code_key" ON "PriceList"("code");

CREATE TABLE "Price" (
  "id" TEXT PRIMARY KEY, "variantId" TEXT NOT NULL, "priceListId" TEXT NOT NULL, "amount" DECIMAL(12,2) NOT NULL, "compareAt" DECIMAL(12,2),
  CONSTRAINT "Price_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Price_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Price_variantId_priceListId_key" ON "Price"("variantId", "priceListId");

CREATE TABLE "Inventory" (
  "id" TEXT PRIMARY KEY, "variantId" TEXT NOT NULL, "onHand" INTEGER NOT NULL DEFAULT 0, "reserved" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Inventory_variantId_key" ON "Inventory"("variantId");

CREATE TABLE "Region" (
  "code" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "currency" TEXT NOT NULL, "gateway" "Gateway" NOT NULL, "taxMode" "TaxMode" NOT NULL DEFAULT 'dap',
  "freeShippingAbove" DECIMAL(12,2), "defaultCountry" TEXT NOT NULL, "priceListId" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Region_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "RegionCountry" (
  "countryCode" TEXT PRIMARY KEY, "regionCode" TEXT NOT NULL, "name" TEXT NOT NULL,
  CONSTRAINT "RegionCountry_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ShippingRule" (
  "id" TEXT PRIMARY KEY, "regionCode" TEXT NOT NULL, "name" TEXT NOT NULL, "carrier" TEXT NOT NULL, "baseAmount" DECIMAL(12,2) NOT NULL,
  "perKg" DECIMAL(12,2) NOT NULL DEFAULT 0, "etaMinDays" INTEGER NOT NULL, "etaMaxDays" INTEGER NOT NULL, "freeAbove" DECIMAL(12,2),
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ShippingRule_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Customer" (
  "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "phone" TEXT, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL DEFAULT '', "passwordHash" TEXT,
  "emailVerifiedAt" TIMESTAMPTZ(3), "marketingOptIn" BOOLEAN NOT NULL DEFAULT false, "defaultRegion" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL, "deletedAt" TIMESTAMPTZ(3)
);
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY, "customerId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "expiresAt" TIMESTAMPTZ(3) NOT NULL, "ip" TEXT, "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

CREATE TABLE "Cart" (
  "id" TEXT PRIMARY KEY, "customerId" TEXT, "regionCode" TEXT NOT NULL, "currency" TEXT NOT NULL, "couponCode" TEXT, "email" TEXT,
  "shippingAddress" JSONB, "shippingOptionId" TEXT, "convertedOrderId" TEXT, "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "CartLine" (
  "id" TEXT PRIMARY KEY, "cartId" TEXT NOT NULL, "variantId" TEXT NOT NULL, "qty" INTEGER NOT NULL,
  CONSTRAINT "CartLine_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartLine_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CartLine_cartId_variantId_key" ON "CartLine"("cartId", "variantId");

CREATE TABLE "Coupon" (
  "id" TEXT PRIMARY KEY, "code" TEXT NOT NULL, "type" "CouponType" NOT NULL, "value" DECIMAL(12,2) NOT NULL, "minSubtotal" DECIMAL(12,2), "minQty" INTEGER,
  "regions" TEXT[] DEFAULT ARRAY[]::TEXT[], "startsAt" TIMESTAMPTZ(3), "endsAt" TIMESTAMPTZ(3), "usageLimit" INTEGER, "usedCount" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true, "description" TEXT
);
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY, "number" TEXT NOT NULL, "customerId" TEXT, "email" TEXT NOT NULL, "phone" TEXT, "regionCode" TEXT NOT NULL, "currency" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'pending', "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'initiated', "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'unfulfilled',
  "subtotal" DECIMAL(12,2) NOT NULL, "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0, "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0, "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "grandTotal" DECIMAL(12,2) NOT NULL, "fxRateToINR" DECIMAL(12,6) NOT NULL DEFAULT 1, "couponCode" TEXT, "shippingAddress" JSONB NOT NULL, "billingAddress" JSONB, "shippingMethod" JSONB,
  "notes" TEXT, "source" TEXT NOT NULL DEFAULT 'web', "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
  "placedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "effectiveAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "paidAt" TIMESTAMPTZ(3), "cancelledAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_placedAt_idx" ON "Order"("placedAt");

CREATE TABLE "OrderLine" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "variantId" TEXT, "productName" TEXT NOT NULL, "variantTitle" TEXT NOT NULL, "productSlug" TEXT NOT NULL, "sku" TEXT NOT NULL,
  "image" TEXT, "qty" INTEGER NOT NULL, "unitPrice" DECIMAL(12,2) NOT NULL, "lineTotal" DECIMAL(12,2) NOT NULL, "weightGrams" INTEGER NOT NULL DEFAULT 0, "hsCode" TEXT,
  CONSTRAINT "OrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderLine_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "gateway" "Gateway" NOT NULL, "gatewayOrderId" TEXT, "gatewayPaymentId" TEXT, "amount" DECIMAL(12,2) NOT NULL, "currency" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'initiated', "method" TEXT, "raw" JSONB,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Payment_gatewayPaymentId_key" ON "Payment"("gatewayPaymentId");

CREATE TABLE "WebhookEvent" (
  "id" TEXT PRIMARY KEY, "gateway" TEXT NOT NULL, "eventId" TEXT NOT NULL, "type" TEXT NOT NULL, "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMPTZ(3), "error" TEXT
);
CREATE UNIQUE INDEX "WebhookEvent_gateway_eventId_key" ON "WebhookEvent"("gateway", "eventId");

CREATE TABLE "Shipment" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "carrier" TEXT NOT NULL, "service" TEXT, "awb" TEXT, "trackingUrl" TEXT, "status" TEXT NOT NULL DEFAULT 'pending',
  "events" JSONB NOT NULL DEFAULT '[]', "estimatedDelivery" TIMESTAMPTZ(3), "shippedAt" TIMESTAMPTZ(3), "deliveredAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

CREATE TABLE "BlogPost" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "excerpt" TEXT NOT NULL, "bodyHtml" TEXT NOT NULL, "coverImage" TEXT NOT NULL,
  "authorName" TEXT NOT NULL DEFAULT 'Xiphias Superfoods', "category" TEXT NOT NULL, "tags" TEXT[] DEFAULT ARRAY[]::TEXT[], "wordCount" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMPTZ(3) NOT NULL, "shopifyId" TEXT, "seoTitle" TEXT, "seoDescription" TEXT, "status" TEXT NOT NULL DEFAULT 'published',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

CREATE TABLE "Page" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "bodyHtml" TEXT NOT NULL, "seoTitle" TEXT, "seoDescription" TEXT, "status" TEXT NOT NULL DEFAULT 'published',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

CREATE TABLE "Banner" (
  "id" TEXT PRIMARY KEY, "placement" TEXT NOT NULL, "title" TEXT, "subtitle" TEXT, "image" TEXT NOT NULL, "ctaLabel" TEXT, "ctaHref" TEXT,
  "regions" TEXT[] DEFAULT ARRAY[]::TEXT[], "startsAt" TIMESTAMPTZ(3), "endsAt" TIMESTAMPTZ(3), "sortOrder" INTEGER NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "NewsletterSubscriber" (
  "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending', "source" TEXT NOT NULL DEFAULT 'footer', "regionCode" TEXT, "token" TEXT NOT NULL,
  "confirmedAt" TIMESTAMPTZ(3), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE UNIQUE INDEX "NewsletterSubscriber_token_key" ON "NewsletterSubscriber"("token");

CREATE TABLE "SiteSetting" ("key" TEXT PRIMARY KEY, "value" JSONB NOT NULL);
CREATE TABLE "Redirect" ("fromPath" TEXT PRIMARY KEY, "toPath" TEXT NOT NULL, "code" INTEGER NOT NULL DEFAULT 301);

CREATE TABLE "Lead" (
  "id" TEXT PRIMARY KEY, "reference" TEXT NOT NULL, "source" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'new', "company" TEXT, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "phone" TEXT, "country" TEXT, "interest" TEXT, "products" TEXT[] DEFAULT ARRAY[]::TEXT[], "volume" TEXT, "message" TEXT, "ownerId" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE UNIQUE INDEX "Lead_reference_key" ON "Lead"("reference");

CREATE TABLE "Outbox" (
  "id" TEXT PRIMARY KEY, "type" TEXT NOT NULL, "payload" JSONB NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending', "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastError" TEXT, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMPTZ(3)
);
CREATE INDEX "Outbox_status_nextAttemptAt_idx" ON "Outbox"("status", "nextAttemptAt");
