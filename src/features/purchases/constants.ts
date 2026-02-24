export const REPORT_CREDIT_COST = 1

// static fallback for the SSG pricing page (can't access DB at build time)
// must stay in sync with products in Polar/RC dashboards
export const PRICING_SSG_FALLBACK = [
  {
    credits: 1,
    slug: 'credits-1',
    price: '$4.99',
    pricePerCredit: '$4.99',
    badge: null,
  },
  {
    credits: 3,
    slug: 'credits-3',
    price: '$12.99',
    pricePerCredit: '$4.33',
    badge: 'popular' as const,
  },
  {
    credits: 6,
    slug: 'credits-6',
    price: '$24.99',
    pricePerCredit: '$4.17',
    badge: null,
  },
] as const
