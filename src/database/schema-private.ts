// tables here are excluded from zero's replication publication (zero_takeout).
// if you add/remove a table, also update PRIVATE_TABLES in migrate.ts
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

import type { InferSelectModel } from 'drizzle-orm'
import type { CanonicalReport, SourceReport } from '~/features/reports/types'

export type Whitelist = InferSelectModel<typeof whitelist>

export const user = pgTable('user', (t) => ({
  id: t.varchar('id').primaryKey(),
  username: t.varchar('username', { length: 200 }),
  name: t.varchar('name', { length: 200 }),
  email: t.varchar('email', { length: 200 }).notNull().unique(),
  normalizedEmail: t.varchar('normalizedEmail', { length: 200 }).unique(),
  updatedAt: t.timestamp('updatedAt', { mode: 'string' }).defaultNow(),
  emailVerified: t.boolean('emailVerified').default(false).notNull(),
  image: t.text('image'),
  createdAt: t.timestamp('createdAt', { mode: 'string' }).defaultNow(),
  role: t.varchar('role').default('user').notNull(),
  banned: t.boolean('banned').default(false).notNull(),
  banReason: t.varchar('banReason'),
  banExpires: t.bigint('banExpires', { mode: 'number' }),
}))

export type UserPrivate = InferSelectModel<typeof user>

export const account = pgTable('account', (t) => ({
  id: t.text('id').primaryKey().notNull(),
  accountId: t.text('accountId').notNull(),
  providerId: t.text('providerId').notNull(),
  userId: t
    .text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: t.text('accessToken'),
  refreshToken: t.text('refreshToken'),
  idToken: t.text('idToken'),
  accessTokenExpiresAt: t.timestamp('accessTokenExpiresAt', { mode: 'string' }),
  refreshTokenExpiresAt: t.timestamp('refreshTokenExpiresAt', { mode: 'string' }),
  scope: t.text('scope'),
  password: t.text('password'),
  createdAt: t.timestamp('createdAt', { mode: 'string' }).notNull(),
  updatedAt: t.timestamp('updatedAt', { mode: 'string' }).notNull(),
}))

export const session = pgTable('session', (t) => ({
  id: t.text('id').primaryKey().notNull(),
  expiresAt: t.timestamp('expiresAt', { mode: 'string' }).notNull(),
  token: t.text('token').notNull(),
  createdAt: t.timestamp('createdAt', { mode: 'string' }).notNull(),
  updatedAt: t.timestamp('updatedAt', { mode: 'string' }).notNull(),
  ipAddress: t.text('ipAddress'),
  userAgent: t.text('userAgent'),
  userId: t
    .text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: t.varchar('impersonatedBy'),
}))

export const jwks = pgTable('jwks', (t) => ({
  id: t.text('id').primaryKey().notNull(),
  publicKey: t.text('publicKey').notNull(),
  privateKey: t.text('privateKey').notNull(),
  createdAt: t.timestamp('createdAt', { mode: 'string' }).notNull(),
}))

export const verification = pgTable('verification', (t) => ({
  id: t.text('id').primaryKey().notNull(),
  identifier: t.text('identifier').notNull(),
  value: t.text('value').notNull(),
  expiresAt: t.timestamp('expiresAt', { mode: 'string' }).notNull(),
  createdAt: t.timestamp('createdAt', { mode: 'string' }),
  updatedAt: t.timestamp('updatedAt', { mode: 'string' }),
}))

export const whitelist = pgTable('whitelist', (t) => ({
  id: t.text('id').primaryKey().notNull(),
  email: t.varchar('email', { length: 200 }).notNull().unique(),
  createdAt: t.timestamp('createdAt', { mode: 'string' }).defaultNow(),
}))

// reportHtml - raw HTML storage reference (can be reused across reports)
export const reportHtml = pgTable(
  'reportHtml',
  {
    id: text('id').primaryKey(),
    vehicleId: text('vehicleId').notNull(),
    provider: text('provider').notNull(), // 'autocheck' | 'carfax'
    providerVersion: text('providerVersion'),
    r2Key: text('r2Key').notNull(), // s3/r2 storage key
    r2Bucket: text('r2Bucket').notNull().default('reports'),
    contentHash: text('contentHash').notNull(), // sha256 for dedup
    fileSizeBytes: integer('fileSizeBytes'),
    reportDate: timestamp('reportDate', { mode: 'string' }), // when source generated it
    r2UploadStatus: text('r2UploadStatus').notNull().default('pending'), // 'pending' | 'uploaded' | 'failed'
    uploadedAt: timestamp('uploadedAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('reportHtml_vehicleId_idx').on(table.vehicleId),
    index('reportHtml_contentHash_idx').on(table.contentHash),
  ]
)

// parsedReport - source-specific parsed data
export const parsedReport = pgTable(
  'parsedReport',
  {
    id: text('id').primaryKey(),
    reportHtmlId: text('reportHtmlId').notNull(),
    vehicleId: text('vehicleId').notNull(),
    vehicleReportId: text('vehicleReportId').notNull(), // links to the purchased report
    provider: text('provider').notNull(),
    parserVersion: text('parserVersion').notNull(),
    parsedAt: timestamp('parsedAt', { mode: 'string' }).defaultNow().notNull(),
    status: text('status').notNull().default('success'), // 'success' | 'partial' | 'failed'
    errorMessage: text('errorMessage'),

    // summary extracted from this source
    estimatedOwners: integer('estimatedOwners'),
    accidentCount: integer('accidentCount'),
    odometerLastReported: integer('odometerLastReported'),
    odometerLastDate: text('odometerLastDate'),
    odometerIssues: boolean('odometerIssues').default(false),
    titleBrands: jsonb('titleBrands').$type<string[]>(),
    totalLoss: boolean('totalLoss').default(false),

    // provider scoring
    providerScore: integer('providerScore'),
    providerScoreRangeLow: integer('providerScoreRangeLow'),
    providerScoreRangeHigh: integer('providerScoreRangeHigh'),

    // full parsed data
    rawParsedJson: jsonb('rawParsedJson').$type<SourceReport>(),
  },
  (table) => [
    index('parsedReport_vehicleReportId_idx').on(table.vehicleReportId),
    index('parsedReport_vehicleId_idx').on(table.vehicleId),
  ]
)

// timelineEvent - normalized events for a specific purchased report
export const timelineEvent = pgTable(
  'timelineEvent',
  {
    id: text('id').primaryKey(),
    vehicleReportId: text('vehicleReportId').notNull(),
    vehicleId: text('vehicleId').notNull(),

    // event data
    eventType: text('eventType').notNull(),
    eventSubtype: text('eventSubtype'),
    eventDate: text('eventDate').notNull(), // ISO date
    eventDatePrecision: text('eventDatePrecision').notNull().default('day'),
    location: text('location'),
    state: text('state'),
    country: text('country').default('US'),
    odometerMiles: integer('odometerMiles'),
    summary: text('summary').notNull(),
    details: text('details'),
    detailsJson: jsonb('detailsJson'),
    severity: text('severity'),
    isNegative: boolean('isNegative').default(false),
    ownerSequence: integer('ownerSequence'),

    // provenance
    sources:
      jsonb('sources').$type<
        Array<{
          parsedReportId: string
          provider: string
          confidence: number
          rawEvidence: string
        }>
      >(),
    fingerprint: text('fingerprint').notNull(),

    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('timelineEvent_vehicleReportId_idx').on(table.vehicleReportId),
    index('timelineEvent_eventType_idx').on(table.eventType),
    index('timelineEvent_eventDate_idx').on(table.eventDate),
  ]
)

// creditTransaction - audit trail for credit changes
export const creditTransaction = pgTable(
  'creditTransaction',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    amount: integer('amount').notNull(), // positive = add, negative = deduct
    type: text('type').notNull(), // 'purchase', 'refund', 'admin_grant', 'report_purchase'
    referenceId: text('referenceId'), // VIN or payment ID
    description: text('description'),

    // payment provider tracking (only for purchase/refund from webhooks)
    platform: text('platform'), // 'polar' | 'revenuecat' | null
    platformTransactionId: text('platformTransactionId'), // external transaction ID
    platformEventType: text('platformEventType'), // 'order.paid' | 'NON_RENEWING_PURCHASE'
    productId: text('productId'), // payment product ID
    amountCents: integer('amountCents'), // price in cents (USD)
    currency: text('currency'), // ISO currency code
    rawPayload: jsonb('rawPayload'), // raw webhook payload for debugging

    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('creditTransaction_userId_idx').on(table.userId),
    // idempotency: unique on (platform, platformTransactionId) - NULLs allowed for non-payment transactions
    unique('creditTransaction_platform_txid_unique').on(
      table.platform,
      table.platformTransactionId
    ),
  ]
)

// productProvider - maps products to external provider IDs
export const productProvider = pgTable(
  'productProvider',
  {
    id: text('id').primaryKey(),
    productId: text('productId').notNull(),
    provider: text('provider').notNull(), // 'polar' | 'revenuecat'
    externalProductId: text('externalProductId').notNull(),
    externalData: jsonb('externalData'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }),
  },
  (table) => [
    unique('productProvider_provider_extId_unique').on(
      table.provider,
      table.externalProductId
    ),
    unique('productProvider_productId_provider_unique').on(
      table.productId,
      table.provider
    ),
  ]
)

// customerProvider - maps users to external provider customer IDs
export const customerProvider = pgTable(
  'customerProvider',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    provider: text('provider').notNull(), // 'polar' | 'revenuecat'
    externalCustomerId: text('externalCustomerId').notNull(),
    externalData: jsonb('externalData'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }),
  },
  (table) => [
    unique('customerProvider_userId_provider_unique').on(table.userId, table.provider),
    unique('customerProvider_provider_extId_unique').on(
      table.provider,
      table.externalCustomerId
    ),
  ]
)

// order - tracks purchases and refunds from payment providers
export const order = pgTable(
  'order',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    productId: text('productId').notNull(),
    type: text('type').notNull(), // 'purchase' | 'refund'
    status: text('status').notNull().default('completed'),
    credits: integer('credits').notNull(),
    amountCents: integer('amountCents'),
    currency: text('currency'),
    provider: text('provider').notNull(), // 'polar' | 'revenuecat'
    providerOrderId: text('providerOrderId').notNull(),
    providerEventType: text('providerEventType'),
    rawPayload: jsonb('rawPayload'),
    creditTransactionId: text('creditTransactionId'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    unique('order_provider_orderId_unique').on(table.provider, table.providerOrderId),
    index('order_userId_idx').on(table.userId),
    index('order_productId_idx').on(table.productId),
  ]
)

// reportShareToken - share tokens for public report access
export const reportShareToken = pgTable(
  'reportShareToken',
  {
    id: text('id').primaryKey(),
    vehicleReportId: text('vehicleReportId').notNull(),
    userId: text('userId').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    revokedAt: timestamp('revokedAt', { mode: 'string' }),
  },
  (table) => [
    index('reportShareToken_token_idx').on(table.token),
    index('reportShareToken_vehicleReportId_idx').on(table.vehicleReportId),
  ]
)

// vinCheckCache - caches record counts from free check endpoint for credit-saving reuse
export const vinCheckCache = pgTable(
  'vinCheckCache',
  {
    id: text('id').primaryKey(),
    vin: text('vin').notNull(),

    // record counts from the free "check" endpoint
    carfaxRecords: integer('carfaxRecords').notNull().default(0),
    autocheckRecords: integer('autocheckRecords').notNull().default(0),

    // vehicle info from check
    model: text('model'),
    year: integer('year'),

    // links to reportHtml + parsedReport for reuse (null = check only, no purchase yet)
    carfaxReportHtmlId: text('carfaxReportHtmlId'),
    autocheckReportHtmlId: text('autocheckReportHtmlId'),
    carfaxParsedReportId: text('carfaxParsedReportId'),
    autocheckParsedReportId: text('autocheckParsedReportId'),

    checkedAt: timestamp('checkedAt', { mode: 'string' }).defaultNow().notNull(),
    lastVerifiedAt: timestamp('lastVerifiedAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('vinCheckCache_vin_idx').on(table.vin),
    unique('vinCheckCache_vin_counts_unique').on(
      table.vin,
      table.carfaxRecords,
      table.autocheckRecords
    ),
  ]
)

// promo - promotional codes for bonus credits, discounts, etc.
export const promo = pgTable(
  'promo',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    type: text('type').notNull(), // 'bonus_credits' | 'discount_percent' | 'discount_fixed'
    value: integer('value').notNull(), // credits, percent, or cents depending on type
    maxUses: integer('maxUses'), // null = unlimited
    useCount: integer('useCount').notNull().default(0),
    validUntil: timestamp('validUntil', { mode: 'string' }),
    productIds: jsonb('productIds').$type<string[]>(), // restrict to specific products
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [index('promo_code_idx').on(table.code)]
)
