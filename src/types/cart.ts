import type { MenuItem, ProductSize } from './menu'

export type CartItem = {
  item: MenuItem
  size: ProductSize | null
  quantity: number
}
