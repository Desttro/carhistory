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
CREATE INDEX "reportShareToken_token_idx" ON "reportShareToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX "reportShareToken_vehicleReportId_idx" ON "reportShareToken" USING btree ("vehicleReportId");