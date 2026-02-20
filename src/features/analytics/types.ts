export type AnalyticsEvent =
  | {
      type: 'user_signup'
      properties: {
        method: 'email' | 'google' | 'github'
        source?: string
      }
    }
  | {
      type: 'user_onboarded'
      properties: {
        userId: string
        hasCompletedProfile: boolean
      }
    }
  | {
      type: 'profile_updated'
      properties: {
        fieldsUpdated: string[]
      }
    }
  | {
      type: 'post_created'
      properties: {
        postId: string
        hasImage?: boolean
        isDraft?: boolean
        contentLength?: number
        hasMedia?: boolean
      }
    }
  | {
      type: 'post_deleted'
      properties: {
        postId: string
        postAge?: number
        hasImage?: boolean
        isDraft?: boolean
      }
    }
  | {
      type: 'post_liked'
      properties: {
        postId: string
        authorId?: string
      }
    }
  | {
      type: 'post_unliked'
      properties: {
        postId: string
      }
    }
  | {
      type: 'user_blocked'
      properties: {
        targetUserId: string
      }
    }
  | {
      type: 'user_unblocked'
      properties: {
        targetUserId: string
      }
    }
  | {
      type: 'feed_viewed'
      properties: {
        feedType: 'home' | 'profile' | 'explore'
        postsLoaded: number
      }
    }
  | {
      type: 'feature_used'
      properties: {
        featureName: string
        context?: string
      }
    }
  | {
      type: 'error_occurred'
      properties: {
        errorCode: string
        errorMessage: string
        userId?: string
      }
    }
  | {
      type: 'api_error'
      properties: {
        status: number
        errorCode?: string
        errorMessage?: string
        endpoint: string
        method: string
        responseBody?: any
      }
    }
  | {
      type: 'log_info'
      properties: {
        message: string
        data?: any
        timestamp: number
        platform?: string
      }
    }
  | {
      type: 'log_warn'
      properties: {
        message: string
        data?: any
        timestamp: number
        platform?: string
      }
    }
  | {
      type: 'user_login'
      properties: { method: 'email' | 'phone' | 'social' | 'demo' | 'admin' }
    }
  | { type: 'user_logout'; properties: {} }
  | { type: 'onboarding_completed'; properties: {} }
  | {
      type: 'vin_searched'
      properties: { vin: string; success: boolean; error?: string }
    }
  | {
      type: 'report_purchased'
      properties: { vin: string; reportId?: string; success: boolean; error?: string }
    }
  | {
      type: 'credit_purchase_initiated'
      properties: { slug: string; platform: 'polar' | 'revenuecat' }
    }
  | {
      type: 'credits_purchased'
      properties: {
        userId: string
        credits: number
        platform: string
        amountCents?: number
      }
    }
  | {
      type: 'credits_refunded'
      properties: { userId: string; credits: number; platform: string }
    }
  | { type: 'comment_created'; properties: { postId: string; contentLength: number } }
  | { type: 'post_reported'; properties: { postId: string; reason: string } }
  | {
      type: 'profile_shared'
      properties: { targetUserId: string; method: 'clipboard' | 'share_sheet' }
    }
  | { type: 'search_performed'; properties: { query: string; resultCount: number } }
  | {
      type: 'report_shared'
      properties: { reportId: string; method: 'clipboard' | 'share_sheet' }
    }

// helper type to extract properties for a specific event type
export type EventProperties<T extends AnalyticsEvent['type']> = Extract<
  AnalyticsEvent,
  { type: T }
>['properties']

export interface Analytics {
  track<T extends AnalyticsEvent['type']>(event: T, properties: EventProperties<T>): void
  identify(userId: string, properties?: Record<string, any>): void
  reset(): void
}
