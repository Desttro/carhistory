import { zql } from 'on-zero'

export const activeProducts = () => {
  return zql.product.where('isActive', true).orderBy('sortOrder', 'asc')
}
