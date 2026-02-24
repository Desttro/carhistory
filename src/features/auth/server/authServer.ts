import { expo } from '@better-auth/expo'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { time } from '@take-out/helpers'
import { betterAuth } from 'better-auth'
import { admin, bearer, emailOTP, jwt, magicLink, phoneNumber } from 'better-auth/plugins'
import { eq, and } from 'drizzle-orm'

import { APP_NAME, DOMAIN } from '~/constants/app'
import { getDb } from '~/database'
import { database } from '~/database/database'
import { productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'
import { polarClient } from '~/features/purchases/server/providers/polar'
import {
  handleOrderPaid,
  handleOrderRefunded,
  handleProductCreated,
  handleProductUpdated,
} from '~/features/purchases/server/webhooks/polar'
import { syncAllProducts } from '~/features/purchases/server/productSync'
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
import { createMagicLinkEmail } from './emails/MagicLinkEmail'
import { createVerificationCodeEmail } from './emails/VerificationCodeEmail'
import { storeOTP } from './lastOTP'
import { sendEmail } from './sendEmail'

console.info(`[better-auth] server`, BETTER_AUTH_SECRET.slice(0, 3), BETTER_AUTH_URL)

// debounce product sync to prevent HMR re-evaluation thrashing
let syncTimeout: ReturnType<typeof setTimeout> | undefined
clearTimeout(syncTimeout)
syncTimeout = setTimeout(() => {
  syncAllProducts().catch((err) => {
    console.info('[product-sync] startup sync failed:', err)
  })
}, 500)

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
    `https://*.${DOMAIN}`,
    `https://${DOMAIN}`,
    `wss://*.${DOMAIN}`,
    `http://localhost:${process.env.VITE_PORT_WEB || '8081'}`,
    `http://host.docker.internal:${process.env.VITE_PORT_WEB || '8081'}`,
    `${APP_SCHEME}://`,
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
        if (process.env.NODE_ENV === 'development') {
          console.info('Magic link email would be sent to:', email, 'with URL:', url)
        } else {
          await sendEmail({
            to: email,
            subject: `Sign in to ${APP_NAME}`,
            react: createMagicLinkEmail({ url, email }),
          })
        }
      },
    }),

    admin(),

    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (process.env.NODE_ENV === 'development') {
          console.info(`\n${'='.repeat(60)}`)
          console.info(`📧 OTP CODE for ${email}: ${otp}`)
          console.info(`${'='.repeat(60)}\n`)
          storeOTP(email, otp)
        } else {
          await sendEmail({
            to: email,
            subject: `${APP_NAME} verification code: ${otp}`,
            react: createVerificationCodeEmail({ code: otp, email }),
          })
        }
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
