import type { CartItem } from '../types/cart'
import type { MenuItem, ProductSize } from '../types/menu'

export function getCartItemKey(item: MenuItem, size: ProductSize | null) {
  return `${item.id}:${size?.id ?? 'default'}`
}

export function isSameCartItem(entry: CartItem, item: MenuItem, size: ProductSize | null) {
  return getCartItemKey(entry.item, entry.size) === getCartItemKey(item, size)
}
