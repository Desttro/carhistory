// deno-lint-ignore-file
/* eslint-disable */
// biome-ignore: needed import
import type { OneRouter } from 'one'

declare module 'one' {
  export namespace OneRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: 
        | `/`
        | `/(app)`
        | `/(app)/auth`
        | `/(app)/auth/login`
        | `/(app)/auth/signup/otp`
        | `/(app)/home`
        | `/(app)/home/(tabs)`
        | `/(app)/home/(tabs)/ai`
        | `/(app)/home/(tabs)/ai/`
        | `/(app)/home/(tabs)/feed`
        | `/(app)/home/(tabs)/feed/`
        | `/(app)/home/(tabs)/pricing`
        | `/(app)/home/(tabs)/pricing/`
        | `/(app)/home/(tabs)/profile`
        | `/(app)/home/(tabs)/profile/`
        | `/(app)/home/(tabs)/reports`
        | `/(app)/home/(tabs)/reports/`
        | `/(app)/home/(tabs)/search`
        | `/(app)/home/(tabs)/search/`
        | `/(app)/home/(tabs)/vin-lookup`
        | `/(app)/home/(tabs)/vin-lookup/`
        | `/(app)/home/ai`
        | `/(app)/home/ai/`
        | `/(app)/home/feed`
        | `/(app)/home/feed/`
        | `/(app)/home/notification`
        | `/(app)/home/notification/`
        | `/(app)/home/pricing`
        | `/(app)/home/pricing/`
        | `/(app)/home/profile`
        | `/(app)/home/profile/`
        | `/(app)/home/reports`
        | `/(app)/home/reports/`
        | `/(app)/home/search`
        | `/(app)/home/search/`
        | `/(app)/home/settings`
        | `/(app)/home/settings/`
        | `/(app)/home/settings/blocked-users`
        | `/(app)/home/settings/edit-profile`
        | `/(app)/home/vin-lookup`
        | `/(app)/home/vin-lookup/`
        | `/(legal)/eula`
        | `/(legal)/privacy-policy`
        | `/(legal)/terms-of-service`
        | `/_sitemap`
        | `/auth`
        | `/auth/login`
        | `/auth/signup/otp`
        | `/docs`
        | `/eula`
        | `/help`
        | `/home`
        | `/home/(tabs)`
        | `/home/(tabs)/ai`
        | `/home/(tabs)/ai/`
        | `/home/(tabs)/feed`
        | `/home/(tabs)/feed/`
        | `/home/(tabs)/pricing`
        | `/home/(tabs)/pricing/`
        | `/home/(tabs)/profile`
        | `/home/(tabs)/profile/`
        | `/home/(tabs)/reports`
        | `/home/(tabs)/reports/`
        | `/home/(tabs)/search`
        | `/home/(tabs)/search/`
        | `/home/(tabs)/vin-lookup`
        | `/home/(tabs)/vin-lookup/`
        | `/home/ai`
        | `/home/ai/`
        | `/home/feed`
        | `/home/feed/`
        | `/home/notification`
        | `/home/notification/`
        | `/home/pricing`
        | `/home/pricing/`
        | `/home/profile`
        | `/home/profile/`
        | `/home/reports`
        | `/home/reports/`
        | `/home/search`
        | `/home/search/`
        | `/home/settings`
        | `/home/settings/`
        | `/home/settings/blocked-users`
        | `/home/settings/edit-profile`
        | `/home/vin-lookup`
        | `/home/vin-lookup/`
        | `/pricing`
        | `/privacy-policy`
        | `/terms-of-service`
      DynamicRoutes: 
        | `/(app)/auth/signup/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/(tabs)/feed/post/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/(tabs)/feed/profile/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/(tabs)/profile/post/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/(tabs)/reports/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/feed/post/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/feed/profile/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/profile/post/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/reports/${OneRouter.SingleRoutePart<T>}`
        | `/auth/signup/${OneRouter.SingleRoutePart<T>}`
        | `/docs/${OneRouter.SingleRoutePart<T>}`
        | `/home/(tabs)/feed/post/${OneRouter.SingleRoutePart<T>}`
        | `/home/(tabs)/feed/profile/${OneRouter.SingleRoutePart<T>}`
        | `/home/(tabs)/profile/post/${OneRouter.SingleRoutePart<T>}`
        | `/home/(tabs)/reports/${OneRouter.SingleRoutePart<T>}`
        | `/home/feed/post/${OneRouter.SingleRoutePart<T>}`
        | `/home/feed/profile/${OneRouter.SingleRoutePart<T>}`
        | `/home/profile/post/${OneRouter.SingleRoutePart<T>}`
        | `/home/reports/${OneRouter.SingleRoutePart<T>}`
      DynamicRouteTemplate: 
        | `/(app)/auth/signup/[method]`
        | `/(app)/home/(tabs)/feed/post/[feedId]`
        | `/(app)/home/(tabs)/feed/profile/[userId]`
        | `/(app)/home/(tabs)/profile/post/[feedId]`
        | `/(app)/home/(tabs)/reports/[reportId]`
        | `/(app)/home/feed/post/[feedId]`
        | `/(app)/home/feed/profile/[userId]`
        | `/(app)/home/profile/post/[feedId]`
        | `/(app)/home/reports/[reportId]`
        | `/auth/signup/[method]`
        | `/docs/[slug]`
        | `/home/(tabs)/feed/post/[feedId]`
        | `/home/(tabs)/feed/profile/[userId]`
        | `/home/(tabs)/profile/post/[feedId]`
        | `/home/(tabs)/reports/[reportId]`
        | `/home/feed/post/[feedId]`
        | `/home/feed/profile/[userId]`
        | `/home/profile/post/[feedId]`
        | `/home/reports/[reportId]`
      IsTyped: true
      RouteTypes: {
        '/(app)/auth/signup/[method]': RouteInfo<{ method: string }>
        '/(app)/home/(tabs)/feed/post/[feedId]': RouteInfo<{ feedId: string }>
        '/(app)/home/(tabs)/feed/profile/[userId]': RouteInfo<{ userId: string }>
        '/(app)/home/(tabs)/profile/post/[feedId]': RouteInfo<{ feedId: string }>
        '/(app)/home/(tabs)/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/(app)/home/feed/post/[feedId]': RouteInfo<{ feedId: string }>
        '/(app)/home/feed/profile/[userId]': RouteInfo<{ userId: string }>
        '/(app)/home/profile/post/[feedId]': RouteInfo<{ feedId: string }>
        '/(app)/home/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/auth/signup/[method]': RouteInfo<{ method: string }>
        '/docs/[slug]': RouteInfo<{ slug: string }>
        '/home/(tabs)/feed/post/[feedId]': RouteInfo<{ feedId: string }>
        '/home/(tabs)/feed/profile/[userId]': RouteInfo<{ userId: string }>
        '/home/(tabs)/profile/post/[feedId]': RouteInfo<{ feedId: string }>
        '/home/(tabs)/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/home/feed/post/[feedId]': RouteInfo<{ feedId: string }>
        '/home/feed/profile/[userId]': RouteInfo<{ userId: string }>
        '/home/profile/post/[feedId]': RouteInfo<{ feedId: string }>
        '/home/reports/[reportId]': RouteInfo<{ reportId: string }>
      }
    }
  }
}

/**
 * Helper type for route information
 */
type RouteInfo<Params = Record<string, never>> = {
  Params: Params
  LoaderProps: { path: string; params: Params; request?: Request }
}