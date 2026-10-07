export type MenuCategory = {
  id: string
  name: string
}

export type ProductSize = {
  id: string
  name: string
  price: number
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  sizes?: ProductSize[]
  image: string
  categoryId: string
  available: boolean
  discountPercent?: number
  tags?: string[]
  popular?: boolean
  details?: {
    ingredients: string[]
    preparationTime: string
    calories: number
    serving: string
    note?: string
  }
}
