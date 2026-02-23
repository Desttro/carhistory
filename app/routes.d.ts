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
        | `/(app)/home/(tabs)/pricing`
        | `/(app)/home/(tabs)/pricing/`
        | `/(app)/home/(tabs)/profile`
        | `/(app)/home/(tabs)/profile/`
        | `/(app)/home/(tabs)/reports`
        | `/(app)/home/(tabs)/reports/`
        | `/(app)/home/(tabs)/vin-lookup`
        | `/(app)/home/(tabs)/vin-lookup/`
        | `/(app)/home/notification`
        | `/(app)/home/notification/`
        | `/(app)/home/pricing`
        | `/(app)/home/pricing/`
        | `/(app)/home/profile`
        | `/(app)/home/profile/`
        | `/(app)/home/reports`
        | `/(app)/home/reports/`
        | `/(app)/home/settings`
        | `/(app)/home/settings/`
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
        | `/home/(tabs)/pricing`
        | `/home/(tabs)/pricing/`
        | `/home/(tabs)/profile`
        | `/home/(tabs)/profile/`
        | `/home/(tabs)/reports`
        | `/home/(tabs)/reports/`
        | `/home/(tabs)/vin-lookup`
        | `/home/(tabs)/vin-lookup/`
        | `/home/notification`
        | `/home/notification/`
        | `/home/pricing`
        | `/home/pricing/`
        | `/home/profile`
        | `/home/profile/`
        | `/home/reports`
        | `/home/reports/`
        | `/home/settings`
        | `/home/settings/`
        | `/home/settings/edit-profile`
        | `/home/vin-lookup`
        | `/home/vin-lookup/`
        | `/pricing`
        | `/privacy-policy`
        | `/report`
        | `/terms-of-service`
      DynamicRoutes: 
        | `/(app)/auth/signup/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/(tabs)/reports/${OneRouter.SingleRoutePart<T>}`
        | `/(app)/home/reports/${OneRouter.SingleRoutePart<T>}`
        | `/auth/signup/${OneRouter.SingleRoutePart<T>}`
        | `/docs/${OneRouter.SingleRoutePart<T>}`
        | `/home/(tabs)/reports/${OneRouter.SingleRoutePart<T>}`
        | `/home/reports/${OneRouter.SingleRoutePart<T>}`
        | `/report/share/${OneRouter.SingleRoutePart<T>}`
      DynamicRouteTemplate: 
        | `/(app)/auth/signup/[method]`
        | `/(app)/home/(tabs)/reports/[reportId]`
        | `/(app)/home/reports/[reportId]`
        | `/auth/signup/[method]`
        | `/docs/[slug]`
        | `/home/(tabs)/reports/[reportId]`
        | `/home/reports/[reportId]`
        | `/report/share/[token]`
      IsTyped: true
      RouteTypes: {
        '/(app)/auth/signup/[method]': RouteInfo<{ method: string }>
        '/(app)/home/(tabs)/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/(app)/home/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/auth/signup/[method]': RouteInfo<{ method: string }>
        '/docs/[slug]': RouteInfo<{ slug: string }>
        '/home/(tabs)/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/home/reports/[reportId]': RouteInfo<{ reportId: string }>
        '/report/share/[token]': RouteInfo<{ token: string }>
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