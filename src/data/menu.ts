import type { MenuCategory, MenuItem } from '../types/menu'

export const categories: MenuCategory[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'do-uong', name: 'Đồ uống' },
  { id: 'ca-phe', name: 'Cà phê' },
  { id: 'trang-mieng', name: 'Tráng miệng' },
  { id: 'mon-an-vat', name: 'Món ăn vặt' },
]

export const subCategoriesByParent = {
  all: [{ id: 'all', name: 'Tất cả' }],
  'do-uong': [
    { id: 'all', name: 'Tất cả' },
    { id: 'tra-sua', name: 'Trà sữa' },
    { id: 'tra-trai-cay', name: 'Trà trái cây' },
    { id: 'sua-tuoi', name: 'Sữa tươi' },
    { id: 'da-xay', name: 'Đá xay' },
    { id: 'sinh-to', name: 'Sinh tố' },
    { id: 'soda', name: 'Soda' },
  ],
  'ca-phe': [{ id: 'all', name: 'Tất cả' }, { id: 'ca-phe', name: 'Cà phê' }],
  'trang-mieng': [
    { id: 'all', name: 'Tất cả' },
    { id: 'tau-hu', name: 'Tàu hũ' },
    { id: 'kem', name: 'Kem' },
    { id: 'che', name: 'Chè' },
  ],
  'mon-an-vat': [
    { id: 'all', name: 'Tất cả' },
    { id: 'an-vat', name: 'Ăn vặt' },
    { id: 'banh-trang', name: 'Bánh tráng' },
    { id: 'xuc-xich', name: 'Xúc xích' },
    { id: 'my-cay', name: 'Mỳ cay' },
  ],
} as const

const images = {
  drinks: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=85',
  milkTea: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=85',
  fruitTea: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85',
  coffee: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=85',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=85',
  dessert2: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85',
  snacks: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  snack2: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
  soda: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85',
  smoothie: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
}

type MenuSize = {
  id: string
  name: string
  price: number
}

type MenuGroup = {
  categoryId: string
  image: string
  description: string
  items: readonly {
    name: string
    subCategoryId: string
    description?: string
    image?: string
    sizes: readonly MenuSize[]
  }[]
}

const normalizeProductName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const sizeOptions = (small: number, medium: number, large: number): MenuSize[] => [
  { id: 'm', name: 'M', price: small },
  { id: 'l', name: 'L', price: medium },
  { id: 'xl', name: 'XL', price: large },
]

const menuGroups: MenuGroup[] = [
  {
    categoryId: 'do-uong',
    image: images.drinks,
    description: 'Đồ uống đa dạng: trà sữa, trà trái cây, sữa tươi, đá xay, sinh tố và soda.',
    items: [
      { name: 'Trà sữa truyền thống', subCategoryId: 'tra-sua', image: images.milkTea, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Trà sữa matcha', subCategoryId: 'tra-sua', image: images.milkTea, sizes: sizeOptions(28000, 33000, 38000) },
      { name: 'Trà sữa khoai môn', subCategoryId: 'tra-sua', image: images.milkTea, sizes: sizeOptions(30000, 35000, 40000) },
      { name: 'Trà chanh leo', subCategoryId: 'tra-trai-cay', image: images.fruitTea, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Trà đào', subCategoryId: 'tra-trai-cay', image: images.fruitTea, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Trà dâu', subCategoryId: 'tra-trai-cay', image: images.fruitTea, sizes: sizeOptions(22000, 28000, 32000) },
      { name: 'Sữa tươi trân châu đường đen', subCategoryId: 'tra-sua', image: images.milkTea, sizes: sizeOptions(30000, 35000, 40000) },
      { name: 'Đá xay việt quất', subCategoryId: 'da-xay', image: images.smoothie, sizes: sizeOptions(30000, 35000, 42000) },
      { name: 'Đá xay matcha', subCategoryId: 'da-xay', image: images.smoothie, sizes: sizeOptions(30000, 35000, 42000) },
      { name: 'Sinh tố bơ', subCategoryId: 'sinh-to', image: images.smoothie, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Sinh tố xoài', subCategoryId: 'sinh-to', image: images.smoothie, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Soda việt quất', subCategoryId: 'soda', image: images.soda, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Soda đào', subCategoryId: 'soda', image: images.soda, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Soda bạc hà', subCategoryId: 'soda', image: images.soda, sizes: sizeOptions(20000, 25000, 30000) },
    ],
  },
  {
    categoryId: 'ca-phe',
    image: images.coffee,
    description: 'Cà phê và thức uống cà phê đặc trưng King Tea.',
    items: [
      { name: 'Cà phê đen', subCategoryId: 'ca-phe', image: images.coffee, sizes: sizeOptions(15000, 20000, 25000) },
      { name: 'Cà phê sữa', subCategoryId: 'ca-phe', image: images.coffee, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Bạc xỉu', subCategoryId: 'ca-phe', image: images.coffee, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Cà phê muối', subCategoryId: 'ca-phe', image: images.coffee, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Cà phê nâu', subCategoryId: 'ca-phe', image: images.coffee, sizes: sizeOptions(20000, 25000, 30000) },
    ],
  },
  {
    categoryId: 'trang-mieng',
    image: images.dessert,
    description: 'Món tráng miệng ngọt mát: kem, chè và tàu hũ.',
    items: [
      { name: 'Kem dâu', subCategoryId: 'kem', image: images.dessert2, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Kem vani', subCategoryId: 'kem', image: images.dessert2, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Kem socola', subCategoryId: 'kem', image: images.dessert2, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Tàu hũ trứng nướng', subCategoryId: 'tau-hu', image: images.dessert, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Tàu hũ sầu riêng', subCategoryId: 'tau-hu', image: images.dessert, sizes: sizeOptions(30000, 35000, 40000) },
      { name: 'Chè đậu đỏ', subCategoryId: 'che', image: images.dessert, sizes: sizeOptions(22000, 27000, 32000) },
      { name: 'Chè sầu', subCategoryId: 'che', image: images.dessert, sizes: sizeOptions(25000, 30000, 35000) },
    ],
  },
  {
    categoryId: 'mon-an-vat',
    image: images.snacks,
    description: 'Món ăn vặt và snack đa dạng cho mọi lứa tuổi.',
    items: [
      { name: 'Bánh tráng trộn', subCategoryId: 'banh-trang', image: images.snack2, sizes: sizeOptions(15000, 20000, 25000) },
      { name: 'Bánh tráng nướng', subCategoryId: 'banh-trang', image: images.snack2, sizes: sizeOptions(20000, 25000, 30000) },
      { name: 'Xúc xích', subCategoryId: 'xuc-xich', image: images.snacks, sizes: sizeOptions(10000, 15000, 20000) },
      { name: 'Hotdog', subCategoryId: 'xuc-xich', image: images.snacks, sizes: sizeOptions(15000, 20000, 25000) },
      { name: 'Gà rán', subCategoryId: 'an-vat', image: images.snack2, sizes: sizeOptions(30000, 35000, 40000) },
      { name: 'Gà viên chiên', subCategoryId: 'an-vat', image: images.snack2, sizes: sizeOptions(25000, 30000, 35000) },
      { name: 'Mỳ cay thường', subCategoryId: 'my-cay', image: images.snacks, sizes: sizeOptions(35000, 45000, 55000) },
      { name: 'Mỳ cay xúc xích', subCategoryId: 'my-cay', image: images.snacks, sizes: sizeOptions(35000, 45000, 55000) },
    ],
  },
]

export const menuItems: MenuItem[] = menuGroups.flatMap((group) =>
  group.items.map((item) => ({
    id: normalizeProductName(`${group.categoryId}-${item.name}`),
    name: item.name,
    description: item.description ?? group.description,
    price: item.sizes[0]?.price ?? 0,
    image: item.image ?? group.image,
    categoryId: group.categoryId,
    subCategoryId: item.subCategoryId,
    available: true,
    sizes: item.sizes.map((size) => ({
      id: size.id,
      name: size.name,
      price: size.price,
    })),
  })),
)
