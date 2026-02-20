CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creditTransaction" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"referenceId" text,
	"description" text,
	"platform" text,
	"platformTransactionId" text,
	"platformEventType" text,
	"productId" text,
	"amountCents" integer,
	"currency" text,
	"rawPayload" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creditTransaction_platform_txid_unique" UNIQUE("platform","platformTransactionId")
);
--> statement-breakpoint
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
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp NOT NULL
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
CREATE TABLE "parsedReport" (
	"id" text PRIMARY KEY NOT NULL,
	"reportHtmlId" text NOT NULL,
	"vehicleId" text NOT NULL,
	"vehicleReportId" text NOT NULL,
	"provider" text NOT NULL,
	"parserVersion" text NOT NULL,
	"parsedAt" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"errorMessage" text,
	"estimatedOwners" integer,
	"accidentCount" integer,
	"odometerLastReported" integer,
	"odometerLastDate" text,
	"odometerIssues" boolean DEFAULT false,
	"titleBrands" jsonb,
	"totalLoss" boolean DEFAULT false,
	"providerScore" integer,
	"providerScoreRangeLow" integer,
	"providerScoreRangeHigh" integer,
	"rawParsedJson" jsonb
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
CREATE TABLE "promo" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" integer NOT NULL,
	"maxUses" integer,
	"useCount" integer DEFAULT 0 NOT NULL,
	"validUntil" timestamp,
	"productIds" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "reportHtml" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicleId" text NOT NULL,
	"provider" text NOT NULL,
	"providerVersion" text,
	"r2Key" text NOT NULL,
	"r2Bucket" text DEFAULT 'reports' NOT NULL,
	"contentHash" text NOT NULL,
	"fileSizeBytes" integer,
	"reportDate" timestamp,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reportShareToken" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicleReportId" text NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"revokedAt" timestamp,
	CONSTRAINT "reportShareToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"impersonatedBy" varchar
);
--> statement-breakpoint
CREATE TABLE "timelineEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicleReportId" text NOT NULL,
	"vehicleId" text NOT NULL,
	"eventType" text NOT NULL,
	"eventSubtype" text,
	"eventDate" text NOT NULL,
	"eventDatePrecision" text DEFAULT 'day' NOT NULL,
	"location" text,
	"state" text,
	"country" text DEFAULT 'US',
	"odometerMiles" integer,
	"summary" text NOT NULL,
	"details" text,
	"detailsJson" jsonb,
	"severity" text,
	"isNegative" boolean DEFAULT false,
	"ownerSequence" integer,
	"sources" jsonb,
	"fingerprint" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" varchar(200),
	"name" varchar(200),
	"email" varchar(200) NOT NULL,
	"normalizedEmail" varchar(200),
	"updatedAt" timestamp DEFAULT now(),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now(),
	"role" varchar DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"banReason" varchar,
	"banExpires" bigint,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_normalizedEmail_unique" UNIQUE("normalizedEmail")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "whitelist" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "whitelist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "block" (
	"id" text PRIMARY KEY NOT NULL,
	"blockerId" text NOT NULL,
	"blockedId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "block_blocker_blocked_unique" UNIQUE("blockerId","blockedId")
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text,
	"platform" text NOT NULL,
	"platformVersion" text,
	"appVersion" text,
	"pushToken" text,
	"pushEnabled" boolean DEFAULT false NOT NULL,
	"lastActiveAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"email" text,
	"usedBy" text,
	"usedAt" timestamp,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	"maxUses" integer DEFAULT 1 NOT NULL,
	"useCount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "invite_code_unique" UNIQUE("code"),
	CONSTRAINT "invite_code_idx" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"actorId" text,
	"type" text NOT NULL,
	"title" text,
	"body" text,
	"data" text,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"image" text NOT NULL,
	"imageWidth" integer,
	"imageHeight" integer,
	"caption" text,
	"hiddenByAdmin" boolean DEFAULT false NOT NULL,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
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
CREATE TABLE "report" (
	"id" text PRIMARY KEY NOT NULL,
	"reporterId" text NOT NULL,
	"reportedUserId" text,
	"reportedPostId" text,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewedBy" text,
	"reviewedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userCredits" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "userCredits_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "userPublic" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"username" text,
	"image" text,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"hasOnboarded" boolean DEFAULT false NOT NULL,
	"whitelisted" boolean DEFAULT false NOT NULL,
	"migrationVersion" integer DEFAULT 0 NOT NULL,
	"postsCount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userState" (
	"userId" text PRIMARY KEY NOT NULL,
	"darkMode" boolean DEFAULT false NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"timeZone" text DEFAULT 'UTC' NOT NULL,
	"onlineStatus" text DEFAULT 'online' NOT NULL,
	"lastNotificationReadAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" text PRIMARY KEY NOT NULL,
	"vin" text NOT NULL,
	"year" integer,
	"make" text,
	"model" text,
	"trim" text,
	"bodyStyle" text,
	"engine" text,
	"transmission" text,
	"drivetrain" text,
	"fuelType" text,
	"vehicleClass" text,
	"countryOfAssembly" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "vehicle_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "vehicleReport" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicleId" text NOT NULL,
	"userId" text NOT NULL,
	"purchasedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"estimatedOwners" integer,
	"accidentCount" integer,
	"odometerLastReported" integer,
	"odometerLastDate" text,
	"odometerIssues" boolean DEFAULT false,
	"titleBrands" jsonb,
	"totalLoss" boolean DEFAULT false,
	"openRecallCount" integer,
	"eventCount" integer DEFAULT 0,
	"serviceRecordCount" integer DEFAULT 0,
	"sourceProviders" jsonb,
	"canonicalJson" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creditTransaction_userId_idx" ON "creditTransaction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_userId_idx" ON "order" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_productId_idx" ON "order" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "parsedReport_vehicleReportId_idx" ON "parsedReport" USING btree ("vehicleReportId");--> statement-breakpoint
CREATE INDEX "parsedReport_vehicleId_idx" ON "parsedReport" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "promo_code_idx" ON "promo" USING btree ("code");--> statement-breakpoint
CREATE INDEX "reportHtml_vehicleId_idx" ON "reportHtml" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "reportHtml_contentHash_idx" ON "reportHtml" USING btree ("contentHash");--> statement-breakpoint
CREATE INDEX "reportShareToken_token_idx" ON "reportShareToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX "reportShareToken_vehicleReportId_idx" ON "reportShareToken" USING btree ("vehicleReportId");--> statement-breakpoint
CREATE INDEX "timelineEvent_vehicleReportId_idx" ON "timelineEvent" USING btree ("vehicleReportId");--> statement-breakpoint
CREATE INDEX "timelineEvent_eventType_idx" ON "timelineEvent" USING btree ("eventType");--> statement-breakpoint
CREATE INDEX "timelineEvent_eventDate_idx" ON "timelineEvent" USING btree ("eventDate");--> statement-breakpoint
CREATE INDEX "block_blockerId_idx" ON "block" USING btree ("blockerId");--> statement-breakpoint
CREATE INDEX "block_blockedId_idx" ON "block" USING btree ("blockedId");--> statement-breakpoint
CREATE INDEX "comment_postId_idx" ON "comment" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "comment_userId_idx" ON "comment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "device_userId_idx" ON "device" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "device_pushToken_idx" ON "device" USING btree ("pushToken");--> statement-breakpoint
CREATE INDEX "invite_email_idx" ON "invite" USING btree ("email");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "notification_userId_read_idx" ON "notification" USING btree ("userId","read");--> statement-breakpoint
CREATE INDEX "notification_createdAt_idx" ON "notification" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "post_userId_idx" ON "post" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "post_createdAt_idx" ON "post" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_active_sort_idx" ON "product" USING btree ("isActive","sortOrder");--> statement-breakpoint
CREATE INDEX "report_reporterId_idx" ON "report" USING btree ("reporterId");--> statement-breakpoint
CREATE INDEX "report_reportedUserId_idx" ON "report" USING btree ("reportedUserId");--> statement-breakpoint
CREATE INDEX "report_reportedPostId_idx" ON "report" USING btree ("reportedPostId");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "userCredits_userId_idx" ON "userCredits" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "vehicle_make_model_idx" ON "vehicle" USING btree ("make","model");--> statement-breakpoint
CREATE INDEX "vehicleReport_vehicleId_idx" ON "vehicleReport" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "vehicleReport_userId_idx" ON "vehicleReport" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "vehicleReport_expiresAt_idx" ON "vehicleReport" USING btree ("expiresAt");