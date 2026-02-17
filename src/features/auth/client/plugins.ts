import { polarClient } from '@polar-sh/better-auth/client'
import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  phoneNumberClient,
} from 'better-auth/client/plugins'

import { platformClient } from './platformClient'

import type { BetterAuthClientPlugin } from 'better-auth'

export const plugins = [
  adminClient(),
  magicLinkClient(),
  emailOTPClient(),
  phoneNumberClient(),
  platformClient(),
  // @ts-expect-error polar plugin type mismatch with better-auth version
  polarClient(),
] satisfies BetterAuthClientPlugin[]
