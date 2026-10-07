import type { MenuItem } from '../types/menu'

export function getProductPrice(item: MenuItem) {
  if (!item.discountPercent) return item.price
  return Math.round(item.price * (1 - item.discountPercent / 100))
}
