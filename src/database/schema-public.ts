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

export const userPublic = pgTable('userPublic', {
  id: text('id').primaryKey(),
  name: text('name'),
  username: text('username'),
  image: text('image'),
  joinedAt: timestamp('joinedAt', { mode: 'string' }).defaultNow().notNull(),
  hasOnboarded: boolean('hasOnboarded').notNull().default(false),
  whitelisted: boolean('whitelisted').notNull().default(false),
  migrationVersion: integer('migrationVersion').notNull().default(0),
  postsCount: integer('postsCount').notNull().default(0),
})

export const userState = pgTable('userState', {
  userId: text('userId').primaryKey(),
  darkMode: boolean('darkMode').notNull().default(false),
  locale: text('locale').notNull().default('en'),
  timeZone: text('timeZone').notNull().default('UTC'),
  onlineStatus: text('onlineStatus').notNull().default('online'),
  lastNotificationReadAt: timestamp('lastNotificationReadAt', { mode: 'string' }),
})

export const post = pgTable(
  'post',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    image: text('image').notNull(),
    imageWidth: integer('imageWidth'),
    imageHeight: integer('imageHeight'),
    caption: text('caption'),
    hiddenByAdmin: boolean('hiddenByAdmin').notNull().default(false),
    commentCount: integer('commentCount').notNull().default(0),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }),
  },
  (table) => [
    index('post_userId_idx').on(table.userId),
    index('post_createdAt_idx').on(table.createdAt),
  ]
)

export const comment = pgTable(
  'comment',
  {
    id: text('id').primaryKey(),
    postId: text('postId').notNull(),
    userId: text('userId').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('comment_postId_idx').on(table.postId),
    index('comment_userId_idx').on(table.userId),
  ]
)

export const block = pgTable(
  'block',
  {
    id: text('id').primaryKey(),
    blockerId: text('blockerId').notNull(), // user who blocks
    blockedId: text('blockedId').notNull(), // user being blocked
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    unique('block_blocker_blocked_unique').on(table.blockerId, table.blockedId),
    index('block_blockerId_idx').on(table.blockerId),
    index('block_blockedId_idx').on(table.blockedId),
  ]
)

export const report = pgTable(
  'report',
  {
    id: text('id').primaryKey(),
    reporterId: text('reporterId').notNull(),
    reportedUserId: text('reportedUserId'),
    reportedPostId: text('reportedPostId'),
    reason: text('reason').notNull(),
    details: text('details'),
    status: text('status').notNull().default('pending'), // pending, reviewed, resolved
    reviewedBy: text('reviewedBy'),
    reviewedAt: timestamp('reviewedAt', { mode: 'string' }),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('report_reporterId_idx').on(table.reporterId),
    index('report_reportedUserId_idx').on(table.reportedUserId),
    index('report_reportedPostId_idx').on(table.reportedPostId),
    index('report_status_idx').on(table.status),
  ]
)

export const device = pgTable(
  'device',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    name: text('name'),
    platform: text('platform').notNull(), // ios, android, web
    platformVersion: text('platformVersion'),
    appVersion: text('appVersion'),
    pushToken: text('pushToken'),
    pushEnabled: boolean('pushEnabled').notNull().default(false),
    lastActiveAt: timestamp('lastActiveAt', { mode: 'string' }),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }),
  },
  (table) => [
    index('device_userId_idx').on(table.userId),
    index('device_pushToken_idx').on(table.pushToken),
  ]
)

export const invite = pgTable(
  'invite',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    email: text('email'),
    usedBy: text('usedBy'),
    usedAt: timestamp('usedAt', { mode: 'string' }),
    createdBy: text('createdBy'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    expiresAt: timestamp('expiresAt', { mode: 'string' }),
    maxUses: integer('maxUses').notNull().default(1),
    useCount: integer('useCount').notNull().default(0),
  },
  (table) => [
    unique('invite_code_idx').on(table.code),
    index('invite_email_idx').on(table.email),
  ]
)

export const notification = pgTable(
  'notification',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    actorId: text('actorId'), // user who triggered the notification
    type: text('type').notNull(), // 'comment' | 'system'
    title: text('title'),
    body: text('body'),
    data: text('data'), // json string
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('notification_userId_idx').on(table.userId),
    index('notification_userId_read_idx').on(table.userId, table.read),
    index('notification_createdAt_idx').on(table.createdAt),
  ]
)

// vehicle - stores canonical vehicle identity by VIN
export const vehicle = pgTable(
  'vehicle',
  {
    id: text('id').primaryKey(), // use VIN as ID
    vin: text('vin').notNull().unique(),
    year: integer('year'),
    make: text('make'),
    model: text('model'),
    trim: text('trim'),
    bodyStyle: text('bodyStyle'),
    engine: text('engine'),
    transmission: text('transmission'),
    drivetrain: text('drivetrain'),
    fuelType: text('fuelType'),
    vehicleClass: text('vehicleClass'),
    countryOfAssembly: text('countryOfAssembly'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }),
  },
  (table) => [index('vehicle_make_model_idx').on(table.make, table.model)]
)

// vehicleReport - ONE REPORT PER PURCHASE (not per VIN)
// this is the main report entity that users purchase access to
export const vehicleReport = pgTable(
  'vehicleReport',
  {
    id: text('id').primaryKey(),
    vehicleId: text('vehicleId').notNull(), // VIN (links to vehicle table)
    userId: text('userId').notNull(),

    // purchase/access tracking
    purchasedAt: timestamp('purchasedAt', { mode: 'string' }).defaultNow().notNull(),
    expiresAt: timestamp('expiresAt', { mode: 'string' }).notNull(), // purchasedAt + 30 days

    // merged summary from all sources at time of purchase
    estimatedOwners: integer('estimatedOwners'),
    accidentCount: integer('accidentCount'),
    odometerLastReported: integer('odometerLastReported'),
    odometerLastDate: text('odometerLastDate'),
    odometerIssues: boolean('odometerIssues').default(false),
    titleBrands: jsonb('titleBrands').$type<string[]>(),
    totalLoss: boolean('totalLoss').default(false),
    openRecallCount: integer('openRecallCount'),

    // counts
    eventCount: integer('eventCount').default(0),
    serviceRecordCount: integer('serviceRecordCount').default(0),

    // which sources were used
    sourceProviders: jsonb('sourceProviders').$type<string[]>(),

    // full canonical JSON for API response
    canonicalJson: jsonb('canonicalJson'),

    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('vehicleReport_vehicleId_idx').on(table.vehicleId),
    index('vehicleReport_userId_idx').on(table.userId),
    index('vehicleReport_expiresAt_idx').on(table.expiresAt),
  ]
)

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
    rawParsedJson: jsonb('rawParsedJson'),
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

// userCredits - user credit balance for purchasing reports
export const userCredits = pgTable(
  'userCredits',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    balance: integer('balance').notNull().default(0),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }),
  },
  (table) => [index('userCredits_userId_idx').on(table.userId)]
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
