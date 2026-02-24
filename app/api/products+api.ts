import { getActiveProductsWithProviders } from '~/features/purchases/server/productQueries'

export async function GET() {
  const products = await getActiveProductsWithProviders()
  return Response.json(products)
}
