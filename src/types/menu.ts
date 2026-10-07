export type MenuCategory = {
  id: string
  name: string
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  available: boolean
  tags?: string[]
  popular?: boolean
}
