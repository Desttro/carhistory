export type Provider = 'polar' | 'revenuecat'

export type CreditTransactionType = 'purchase' | 'refund' | 'admin_grant' | 'report_purchase'

export interface PaymentMetadata {
  provider: Provider
  providerTransactionId: string
  providerEventType: string
  productId: string
  amountCents?: number
  currency?: string
  rawPayload?: unknown
}

export interface CreditResult {
  success: boolean
  newBalance?: number
  error?: string
}

export interface PurchaseResult extends CreditResult {
  creditsAdded?: number
  alreadyProcessed?: boolean
}

export interface RefundResult extends CreditResult {
  creditsDeducted?: number
  alreadyProcessed?: boolean
}
