import { expo } from '@better-auth/expo'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { time } from '@take-out/helpers'
import { betterAuth } from 'better-auth'
import { admin, bearer, emailOTP, jwt, magicLink, phoneNumber } from 'better-auth/plugins'
import { eq, and } from 'drizzle-orm'

import { DOMAIN } from '~/constants/app'
import { getDb } from '~/database'
import { database } from '~/database/database'
import { productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'
import { polarClient } from '~/features/payments/server/polarClient'
import {
  handleOrderPaid,
  handleOrderRefunded,
  handleProductCreated,
  handleProductUpdated,
} from '~/features/payments/server/polarIntegration'
import { syncAllPolarProducts } from '~/features/payments/server/productSync'
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  POLAR_WEBHOOK_SECRET,
  APPLE_CLIENT_ID,
  APPLE_CLIENT_SECRET,
  APPLE_APP_BUNDLE_IDENTIFIER,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from '~/server/env-server'

import { APP_SCHEME } from '../constants'
import { afterCreateUser } from './afterCreateUser'
import { storeOTP } from './lastOTP'

console.info(`[better-auth] server`, BETTER_AUTH_SECRET.slice(0, 3), BETTER_AUTH_URL)

syncAllPolarProducts().catch((err) => {
  console.info('[product-sync] startup sync failed:', err)
})

export const authServer = betterAuth({
  // using BETTER_AUTH_URL instead of baseUrl

  database,

  rateLimit: {
    enabled: process.env.NODE_ENV === 'production',
    window: 60,
    max: 30, // per minute per IP
    customRules: {
      // stricter limits on auth endpoints (better-auth paths)
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
      '/email-otp/send-verification-otp': { window: 60, max: 3 },
    },
  },

  // cloudflare IP header + cross-subdomain cookies for zero.tamagui.dev
  advanced: {
    ...(BETTER_AUTH_URL.includes(DOMAIN) && {
      crossSubDomainCookies: {
        enabled: true,
        domain: '.carhistory.io',
      },
    }),
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
    },
  },

  session: {
    freshAge: time.minute.days(2),
    storeSessionInDatabase: true,
  },

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [
    // match dev, prod, tauri
    `https://${DOMAIN}`,
    `http://localhost:${process.env.VITE_PORT_WEB || '8081'}`,
    `http://host.docker.internal:${process.env.VITE_PORT_WEB || '8081'}`,
    `${APP_SCHEME}://`,
    'https://preview.carhistory.io',
    'https://zero-preview.carhistory.io',
    'https://carhistory.io',
    'https://zero.carhistory.io',
    'https://media.carhistory.io',
    'https://media-preview.carhistory.io',
    'wss://zero-preview.carhistory.io',
    'wss://zero.carhistory.io',
    'https://carhistory-dev-saby.carhistory.io',
    'https://appleid.apple.com',
  ],

  databaseHooks: {
    user: {
      create: {
        async after(user) {
          // how we nicely move private user => public user for zero:
          await afterCreateUser(user)
        },
      },
    },
  },

  plugins: [
    // for use with react-native, tauri, etc
    jwt({
      jwt: {
        expirationTime: '3y',
      },

      jwks: {
        // compat with zero
        keyPairConfig: { alg: 'EdDSA', crv: 'Ed25519' },
      },
    }),

    bearer(),

    // To support better-auth/client in React Native
    expo(),

    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.info('Magic link email would be sent to:', email, 'with URL:', url)
      },
    }),

    admin(),

    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.info(`\n${'='.repeat(60)}`)
        console.info(`📧 OTP CODE for ${email}: ${otp}`)
        console.info(`${'='.repeat(60)}\n`)

        // Store in dev for testing
        storeOTP(email, otp)
      },
    }),

    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        console.info('Sending OTP SMS to', phoneNumber, 'with code', code)
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          // Initial email for phone-only users
          return `${phoneNumber}@phone.local`
        },
        getTempName: (phoneNumber) => {
          // Initial name for the user
          return ''
        },
      },
    }),

    // polar payments integration
    polar({
      client: polarClient,
      createCustomerOnSignUp: false,
      use: [
        checkout({
          products: async () => {
            const db = getDb()
            const rows = await db
              .select({
                slug: product.slug,
                productId: productProvider.externalProductId,
              })
              .from(product)
              .innerJoin(productProvider, eq(product.id, productProvider.productId))
              .where(
                and(eq(product.isActive, true), eq(productProvider.provider, 'polar'))
              )
            return rows.map((r) => ({ productId: r.productId, slug: r.slug }))
          },
          successUrl: '/home/pricing/success?checkout_id={CHECKOUT_ID}',
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: POLAR_WEBHOOK_SECRET,
          onOrderPaid: handleOrderPaid,
          onOrderRefunded: handleOrderRefunded,
          onProductCreated: handleProductCreated,
          onProductUpdated: handleProductUpdated,
        }),
      ],
    }),
  ],

  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },

  socialProviders: {
    apple: {
      clientId: APPLE_CLIENT_ID,
      clientSecret: APPLE_CLIENT_SECRET,
      // Optional
      appBundleIdentifier: APPLE_APP_BUNDLE_IDENTIFIER,
    },
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
})
