// price mapping for web display (Polar handles actual pricing at checkout)
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
