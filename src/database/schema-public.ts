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

import type { CanonicalReport } from '~/features/reports/types'

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
    canonicalJson: jsonb('canonicalJson').$type<CanonicalReport>(),

    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('vehicleReport_vehicleId_idx').on(table.vehicleId),
    index('vehicleReport_userId_idx').on(table.userId),
    index('vehicleReport_expiresAt_idx').on(table.expiresAt),
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
