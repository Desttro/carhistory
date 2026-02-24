import { useMemo } from 'react'

import { activeProducts } from '~/data/queries/product'
import { useQuery } from '~/zero/client'

import type { PurchasesPackage } from 'react-native-purchases'

export interface ProductForDisplay {
  id: string
  slug: string
  credits: number
  badge: string | null
  price: string
  pricePerCredit?: string
  savingsPercent: number
  isPopular: boolean
  isBestValue: boolean
  rcPackage?: PurchasesPackage
}

interface UseProductsOptions {
  offerings?: { current?: { availablePackages: PurchasesPackage[] } | null } | null
  providerMappings?: Map<string, Record<string, string>>
}

export function useProducts(options?: UseProductsOptions) {
  const [products, productsStatus] = useQuery(activeProducts)

  const displayProducts = useMemo((): ProductForDisplay[] => {
    if (!products.length) return []

    const singlePkg = products.find((p) => p.credits === 1)
    const basePricePerCredit = singlePkg ? singlePkg.priceCents / 100 : 0
    const maxCredits = Math.max(...products.map((p) => p.credits))
    const rcPackages = options?.offerings?.current?.availablePackages
    const mappings = options?.providerMappings

    return products.map((pkg) => {
      // try to match RC package via provider mapping from /api/products
      let rcPackage: PurchasesPackage | undefined
      if (rcPackages) {
        const productMappings = mappings?.get(pkg.id)
        const rcIdentifier = productMappings?.revenuecat
        if (rcIdentifier) {
          rcPackage = rcPackages.find(
            (rcp) => rcp.product.identifier === rcIdentifier
          )
        }

        // fallback: match by credits count if no provider mapping
        if (!rcPackage) {
          rcPackage = rcPackages.find((rcp) => {
            const match = rcp.product.identifier.match(/(\d+)_credit/)
            return match && parseInt(match[1]) === pkg.credits
          })
        }
      }

      // use RC price on native, DB price on web
      const priceNum = rcPackage?.product.price ?? pkg.priceCents / 100
      const price = rcPackage?.product.priceString ?? `$${(pkg.priceCents / 100).toFixed(2)}`
      const ppc = pkg.credits > 0 ? priceNum / pkg.credits : 0
      const pricePerCredit = pkg.credits > 1 ? `$${ppc.toFixed(2)}` : undefined

      const savingsPercent =
        pkg.credits > 1 && basePricePerCredit > 0
          ? Math.round(((basePricePerCredit - ppc) / basePricePerCredit) * 100)
          : 0

      const isBestValue = pkg.credits === maxCredits && pkg.credits > 1

      return {
        id: pkg.id,
        slug: pkg.slug,
        credits: pkg.credits,
        badge: pkg.badge,
        price,
        pricePerCredit,
        savingsPercent,
        isPopular: pkg.badge === 'popular',
        isBestValue,
        rcPackage,
      }
    })
  }, [products, options?.offerings, options?.providerMappings])

  return {
    products: displayProducts,
    isLoading: productsStatus.type === 'unknown',
    hasProducts: products.length > 0,
  }
}
