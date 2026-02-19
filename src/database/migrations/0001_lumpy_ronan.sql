CREATE TABLE "customerProvider" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"externalCustomerId" text NOT NULL,
	"externalData" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "customerProvider_userId_provider_unique" UNIQUE("userId","provider"),
	CONSTRAINT "customerProvider_provider_extId_unique" UNIQUE("provider","externalCustomerId")
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"productId" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"credits" integer NOT NULL,
	"amountCents" integer,
	"currency" text,
	"provider" text NOT NULL,
	"providerOrderId" text NOT NULL,
	"providerEventType" text,
	"rawPayload" jsonb,
	"creditTransactionId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_provider_orderId_unique" UNIQUE("provider","providerOrderId")
);
--> statement-breakpoint
CREATE TABLE "productProvider" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"provider" text NOT NULL,
	"externalProductId" text NOT NULL,
	"externalData" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "productProvider_provider_extId_unique" UNIQUE("provider","externalProductId"),
	CONSTRAINT "productProvider_productId_provider_unique" UNIQUE("productId","provider")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"credits" integer NOT NULL,
	"priceCents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"badge" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "order_userId_idx" ON "order" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_productId_idx" ON "order" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_active_sort_idx" ON "product" USING btree ("isActive","sortOrder");