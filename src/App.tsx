import { useEffect, useMemo, useState } from 'react'
import type { MenuCategory, MenuItem } from './types/menu'
import { categories, menuItems } from './data/menu'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'
import { ProductCard } from './features/menu/ProductCard'
import { ProductDetailModal } from './features/menu/ProductDetailModal'

type CartItem = {
  item: MenuItem
  quantity: number
}

function Icon({
  name,
  size = 20,
}: {
  name: 'search' | 'cart' | 'sun' | 'moon' | 'plus' | 'minus' | 'close' | 'leaf' | 'clock' | 'arrow'
  size?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
    case 'cart':
      return <svg {...common}><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
    case 'moon':
      return <svg {...common}><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14m-7-7h14" /></svg>
    case 'minus':
      return <svg {...common}><path d="M5 12h14" /></svg>
    case 'close':
      return <svg {...common}><path d="m18 6-12 12M6 6l12 12" /></svg>
    case 'leaf':
      return <svg {...common}><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c2-5 6-8 12-11" /></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
    case 'arrow':
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
  }
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isDark, setIsDark] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null)

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory
      const matchesSearch =
        !query ||
        item.name.toLocaleLowerCase('vi').includes(query) ||
        item.description.toLocaleLowerCase('vi').includes(query)
      return matchesCategory && matchesSearch && item.available
    })
  }, [activeCategory, search])

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0)
  const subtotal = cart.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0)

  useEffect(() => {
    if (!selectedProduct) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedProduct(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct])

  function addToCart(item: MenuItem, quantity = 1) {
    setCart((current) => {
      const existing = current.find((entry) => entry.item.id === item.id)
      if (existing) {
        return current.map((entry) =>
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
        )
      }
      return [...current, { item, quantity }]
    })
    setOrderMessage('')
  }

  function changeQuantity(itemId: string, amount: number) {
    setCart((current) =>
      current
        .map((entry) =>
          entry.item.id === itemId ? { ...entry, quantity: entry.quantity + amount } : entry,
        )
        .filter((entry) => entry.quantity > 0),
    )
  }

  const cartPanel = (
    <aside className={`cart-panel${mobileCartOpen ? ' cart-panel--open' : ''}`} aria-label="Giỏ hàng">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">ĐƠN CỦA BẠN</p>
          <h2>Giỏ hàng <span className="cart-count">{cartCount}</span></h2>
        </div>
        <button
          className="icon-button cart-close"
          type="button"
          aria-label="Đóng giỏ hàng"
          onClick={() => setMobileCartOpen(false)}
        >
          <Icon name="close" />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon"><Icon name="cart" size={26} /></div>
          <h3>Chưa có món nào</h3>
          <p>Chọn món bạn yêu thích và thêm vào giỏ nhé.</p>
          <Button variant="secondary" onClick={() => setMobileCartOpen(false)}>Khám phá thực đơn</Button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(({ item, quantity }) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt="" />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>{formatPrice(item.price)}</p>
                  <div className="quantity-control" aria-label={`Số lượng ${item.name}`}>
                    <button type="button" aria-label={`Giảm ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{quantity}</span>
                    <button type="button" aria-label={`Tăng ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                </div>
                <strong className="cart-line-total">{formatPrice(item.price * quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-line"><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div>
            <div className="summary-line"><span>Phí phục vụ</span><strong>Miễn phí</strong></div>
            <div className="summary-total"><span>Tổng cộng</span><strong>{formatPrice(subtotal)}</strong></div>
            <Button
              className="checkout-button"
              onClick={() => setOrderMessage('Đây là bản demo — đơn hàng chưa được gửi đi.')}
            >
              Đặt món <Icon name="arrow" size={18} />
            </Button>
            {orderMessage && <p className="order-message" role="status">{orderMessage}</p>}
            <p className="cart-note">Thanh toán tại quầy sau khi xác nhận món</p>
          </div>
        </>
      )}
    </aside>
  )

  return (
    <div className={`app-shell${isDark ? ' theme-dark' : ''}`}>
      <div className="site-layout">
        <div className="main-column">
          <header className="topbar">
            <a className="brand" href="#" aria-label="Bếp Nhà - trang chủ">
              <span className="brand-mark"><Icon name="leaf" size={22} /></span>
              <span className="brand-name">bếp<span>nhà</span><small>FRESH & LOCAL</small></span>
            </a>
            <div className="topbar-actions">
              <div className="open-status"><span className="status-dot" /> Đang mở cửa</div>
              <button
                className="icon-button theme-toggle"
                type="button"
                aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
                onClick={() => setIsDark((value) => !value)}
              >
                <Icon name={isDark ? 'sun' : 'moon'} />
              </button>
              <button
                className="mobile-cart-button"
                type="button"
                aria-label={`Mở giỏ hàng, có ${cartCount} món`}
                onClick={() => setMobileCartOpen(true)}
              >
                <Icon name="cart" size={19} />
                {cartCount > 0 && <span>{cartCount}</span>}
              </button>
            </div>
          </header>

          <main>
            <section className="hero">
              <div className="hero-content">
                <span className="hero-kicker"><span /> BỮA NGON, VỊ NHÀ</span>
                <h1>Thân quen như<br />bữa cơm <em>nhà.</em></h1>
                <p>Món ngon nấu mỗi ngày, từ nguyên liệu tươi lành và chút yêu thương.</p>
                <div className="hero-details">
                  <span><Icon name="clock" size={16} /> 08:00 – 21:30</span>
                  <span className="detail-divider" />
                  <span><Icon name="leaf" size={16} /> Nguyên liệu tươi</span>
                </div>
              </div>
              <div className="hero-decoration" aria-hidden="true">
                <span className="hero-stamp">NẤU MỖI NGÀY<br /><b>♡</b></span>
              </div>
            </section>

            <section className="menu-section" aria-labelledby="menu-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">BẾP NHÀ GỢI Ý</p>
                  <h2 id="menu-title">Thực đơn hôm nay</h2>
                </div>
                <span className="menu-count">{filteredItems.length} món ngon</span>
              </div>

              <div className="menu-controls">
                <div className="category-list" role="group" aria-label="Lọc theo danh mục">
                  {categories.map((category: MenuCategory) => (
                    <button
                      className={`category-button${activeCategory === category.id ? ' is-active' : ''}`}
                      type="button"
                      key={category.id}
                      aria-pressed={activeCategory === category.id}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                <label className="search-box">
                  <Icon name="search" size={18} />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm món ăn..."
                    aria-label="Tìm món ăn"
                  />
                  {search && (
                    <button type="button" aria-label="Xóa nội dung tìm kiếm" onClick={() => setSearch('')}>
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </label>
              </div>

              {filteredItems.length > 0 ? (
                <div className="product-grid">
                  {filteredItems.map((item) => (
                    <ProductCard
                      item={item}
                      key={item.id}
                      onAdd={addToCart}
                      onDetails={setSelectedProduct}
                      inCart={cart.some((entry) => entry.item.id === item.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <span>🍲</span>
                  <h3>Chưa tìm thấy món phù hợp</h3>
                  <p>Thử tìm với tên món khác hoặc chọn danh mục khác nhé.</p>
                  <Button variant="secondary" onClick={() => { setSearch(''); setActiveCategory('all') }}>
                    Xem tất cả món
                  </Button>
                </div>
              )}
            </section>

            <footer className="site-footer">
              <span>© 2026 Bếp Nhà Quang Vinh · Nấu bằng cả tấm lòng</span>
              <span><Icon name="leaf" size={14} /> Tươi ngon mỗi ngày</span>
            </footer>
          </main>
        </div>
        {cartPanel}
      </div>
      {mobileCartOpen && <button className="cart-backdrop" aria-label="Đóng giỏ hàng" onClick={() => setMobileCartOpen(false)} />}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  )
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`
}

export default App
