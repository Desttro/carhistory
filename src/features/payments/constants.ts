// credit package definitions with platform-specific product IDs
export const CREDIT_PACKAGES = [
  {
    polarProductId: '355d5303-0777-45bd-8ed4-6ec356ec1af1',
    revenuecatProductId: 'cat_history_1_credit',
    credits: 1,
    slug: 'credits-1',
  },
  {
    polarProductId: 'ec5a902d-29a8-42ed-86b9-e494d17c8776',
    revenuecatProductId: 'cat_history_3_credits',
    credits: 3,
    slug: 'credits-3',
  },
  {
    polarProductId: '6e57dc6d-a006-4983-ab42-91b73de38d94',
    revenuecatProductId: 'cat_history_6_credits',
    credits: 6,
    slug: 'credits-6',
  },
] as const

export type Platform = 'polar' | 'revenuecat'

export function getCreditsForProduct(
  productId: string,
  platform: Platform
): number | null {
  const pkg = CREDIT_PACKAGES.find((p) =>
    platform === 'polar'
      ? p.polarProductId === productId
      : p.revenuecatProductId === productId
  )
  return pkg?.credits ?? null
}

export function getPackageBySlug(slug: string) {
  return CREDIT_PACKAGES.find((p) => p.slug === slug)
}

// web price display (Polar handles actual pricing at checkout)
// native uses RevenueCat pricing from App Store
export const PRICE_DISPLAY: Record<string, { price: string; pricePerCredit: string }> = {
  'credits-1': { price: '$4.99', pricePerCredit: '$4.99' },
  'credits-3': { price: '$12.99', pricePerCredit: '$4.33' },
  'credits-6': { price: '$24.99', pricePerCredit: '$4.17' },
}

export const PACKAGE_METADATA: Record<string, { badge?: 'popular' }> = {
  'credits-1': {},
  'credits-3': { badge: 'popular' },
  'credits-6': {},
}
