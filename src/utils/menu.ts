import type { MenuItem, ProductSize } from '../types/menu'

export function getProductPrice(item: MenuItem, size?: ProductSize | null) {
  const price = size?.price ?? item.price
  if (!item.discountPercent) return price
  return Math.round(price * (1 - item.discountPercent / 100))
}
