import { useEffect, useMemo, useState } from 'react'
import type { MenuItem, ProductSize } from './types/menu'
import { categories, menuItems } from './data/menu'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'
import { ProductCard } from './features/menu/ProductCard'
import { ProductDetailModal } from './features/menu/ProductDetailModal'
import { getProductPrice } from './utils/menu'
import { formatMessage, formatPrice, translations, type Language } from './i18n'
import { localizeMenuItem } from './utils/localization'

type CartItem = {
  item: MenuItem
  size: ProductSize | null
  quantity: number
}

function getCartItemKey(item: MenuItem, size: ProductSize | null) {
  return `${item.id}:${size?.id ?? 'default'}`
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
  const [language, setLanguage] = useState<Language>('vi')
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isDark, setIsDark] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null)
  const messages = translations[language]
  const locale = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'vi-VN'
  const localizedItems = useMemo(
    () => menuItems.map((item) => localizeMenuItem(item, language)),
    [language],
  )
  const localizedCategories = categories.map((category) => ({
    ...category,
    name: {
      all: messages.categoryAll,
      'mon-chinh': messages.categoryMain,
      'mon-nhe': messages.categorySnack,
      'do-uong': messages.categoryDrink,
      'trang-mieng': messages.categoryDessert,
    }[category.id] ?? category.name,
  }))

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale)
    return localizedItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory
      const matchesSearch =
        !query ||
        item.name.toLocaleLowerCase(locale).includes(query) ||
        item.description.toLocaleLowerCase(locale).includes(query)
      return matchesCategory && matchesSearch && item.available
    })
  }, [activeCategory, localizedItems, locale, search])

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0)
  const subtotal = cart.reduce((sum, entry) => sum + getProductPrice(entry.item, entry.size) * entry.quantity, 0)
  const orderDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())

  useEffect(() => {
    document.documentElement.lang = language
    document.title = `Bếp Nhà | ${messages.menuTitle}`
  }, [language, messages.menuTitle])

  useEffect(() => {
    if (!selectedProduct && !receiptOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (receiptOpen) setReceiptOpen(false)
        else setSelectedProduct(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, receiptOpen])

  function addToCart(item: MenuItem, size: ProductSize | null = null, quantity = 1) {
    const canonicalItem = menuItems.find((menuItem) => menuItem.id === item.id) ?? item
    const canonicalSize = canonicalItem.sizes?.find((itemSize) => itemSize.id === size?.id) ?? null
    setCart((current) => {
      const itemKey = getCartItemKey(canonicalItem, canonicalSize)
      const existing = current.find((entry) => getCartItemKey(entry.item, entry.size) === itemKey)
      if (existing) {
        return current.map((entry) =>
          getCartItemKey(entry.item, entry.size) === itemKey
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        )
      }
      return [...current, { item: canonicalItem, size: canonicalSize, quantity }]
    })
  }

  function handleAddClick(item: MenuItem) {
    const canonicalItem = menuItems.find((menuItem) => menuItem.id === item.id) ?? item
    if (canonicalItem.sizes?.length) {
      setSelectedProduct(canonicalItem)
      return
    }
    addToCart(canonicalItem)
  }

  function handleDetails(item: MenuItem) {
    setSelectedProduct(menuItems.find((menuItem) => menuItem.id === item.id) ?? item)
  }

  function changeQuantity(item: MenuItem, size: ProductSize | null, amount: number) {
    const itemKey = getCartItemKey(item, size)
    setCart((current) =>
      current
        .map((entry) =>
          getCartItemKey(entry.item, entry.size) === itemKey
            ? { ...entry, quantity: entry.quantity + amount }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    )
  }

  function printOrder() {
    const date = new Date()
    const fileDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    const originalTitle = document.title
    document.title = `don-hang-${fileDate}`
    window.addEventListener('afterprint', () => {
      document.title = originalTitle
    }, { once: true })
    window.print()
  }

  function placeOrder() {
    setMobileCartOpen(false)
    setReceiptOpen(true)
  }

  const cartPanel = (
    <aside className={`cart-panel${mobileCartOpen ? ' cart-panel--open' : ''}`} aria-label={messages.cartTitle}>
      <div className="cart-heading">
        <div>
          <p className="eyebrow">{messages.cartHeading}</p>
          <h2>{messages.cartTitle} <span className="cart-count">{cartCount}</span></h2>
        </div>
        <button
          className="icon-button cart-close"
          type="button"
          aria-label={messages.closeCart}
          onClick={() => setMobileCartOpen(false)}
        >
          <Icon name="close" />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon"><Icon name="cart" size={26} /></div>
          <h3>{messages.emptyCartTitle}</h3>
          <p>{messages.emptyCartDescription}</p>
          <Button variant="secondary" onClick={() => setMobileCartOpen(false)}>{messages.browseMenu}</Button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(({ item, size, quantity }) => {
              const localizedItem = localizeMenuItem(item, language)
              const localizedSize = localizedItem.sizes?.find((itemSize) => itemSize.id === size?.id) ?? null
              return (
                <div className="cart-item" key={getCartItemKey(item, size)}>
                  <img src={item.image} alt="" />
                  <div className="cart-item-info">
                    <h3>{localizedItem.name}</h3>
                    {localizedSize && <p className="cart-item-size">{localizedSize.name}</p>}
                    <p className="cart-item-price">
                      {item.discountPercent && <del>{formatPrice(size?.price ?? item.price, language)}</del>}
                      <strong>{formatPrice(getProductPrice(item, size), language)}</strong>
                    </p>
                    <div className="quantity-control" aria-label={formatMessage(messages.quantityOf, { name: localizedItem.name })}>
                      <button type="button" aria-label={formatMessage(messages.decrease, { name: localizedItem.name })} onClick={() => changeQuantity(item, size, -1)}>
                        <Icon name="minus" size={15} />
                      </button>
                      <span>{quantity}</span>
                      <button type="button" aria-label={formatMessage(messages.increase, { name: localizedItem.name })} onClick={() => changeQuantity(item, size, 1)}>
                        <Icon name="plus" size={15} />
                      </button>
                    </div>
                  </div>
                  <strong className="cart-line-total">{formatPrice(getProductPrice(item, size) * quantity, language)}</strong>
                </div>
              )
            })}
          </div>
          <div className="cart-summary">
            <div className="summary-line"><span>{messages.subtotal}</span><strong>{formatPrice(subtotal, language)}</strong></div>
            <div className="summary-line"><span>{messages.serviceFee}</span><strong>{messages.free}</strong></div>
            <div className="summary-total"><span>{messages.total}</span><strong>{formatPrice(subtotal, language)}</strong></div>
            <Button
              className="checkout-button"
              onClick={placeOrder}
            >
              {messages.placeOrder} <Icon name="arrow" size={18} />
            </Button>
            <p className="cart-note">{messages.cartNote}</p>
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
            <a className="brand" href="#" aria-label={messages.homeLabel}>
              <span className="brand-mark"><Icon name="leaf" size={22} /></span>
              <span className="brand-name">
                {language === 'ja' ? 'ベップ' : language === 'en' ? 'bep' : 'bếp'}
                <span>{language === 'ja' ? 'ニャー' : language === 'en' ? 'nha' : 'nhà'}</span>
                <small>{language === 'ja' ? '新鮮で地元の食材' : language === 'en' ? 'FRESH & LOCAL' : 'FRESH & LOCAL'}</small>
              </span>
            </a>
            <div className="topbar-actions">
              <div className="open-status"><span className="status-dot" /> {messages.openStatus}</div>
              <label className="language-picker">
                <span className="sr-only">{messages.languageLabel}</span>
                <select
                  value={language}
                  aria-label={messages.languageLabel}
                  onChange={(event) => {
                    const nextLanguage = event.target.value
                    if (nextLanguage === 'vi' || nextLanguage === 'en' || nextLanguage === 'ja') {
                      setLanguage(nextLanguage)
                    }
                  }}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </label>
              <button
                className="icon-button theme-toggle"
                type="button"
                aria-label={isDark ? messages.switchToLight : messages.switchToDark}
                onClick={() => setIsDark((value) => !value)}
              >
                <Icon name={isDark ? 'sun' : 'moon'} />
              </button>
              <button
                className="mobile-cart-button"
                type="button"
                aria-label={formatMessage(messages.openCart, { count: cartCount })}
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
                <span className="hero-kicker"><span /> {messages.heroKicker}</span>
                <h1>{messages.heroTitleStart}<br />{messages.heroTitleEnd} <em>{messages.heroTitleEmphasis}</em></h1>
                <p>{messages.heroDescription}</p>
                <div className="hero-details">
                  <span><Icon name="clock" size={16} /> 08:00 – 21:30</span>
                  <span className="detail-divider" />
                  <span><Icon name="leaf" size={16} /> {messages.freshIngredients}</span>
                </div>
              </div>
              <div className="hero-decoration" aria-hidden="true">
                <span className="hero-stamp">{messages.heroStamp}<br /><b>♡</b></span>
              </div>
            </section>

            <section className="menu-section" aria-labelledby="menu-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{messages.menuEyebrow}</p>
                  <h2 id="menu-title">{messages.menuTitle}</h2>
                </div>
                <span className="menu-count">{filteredItems.length} {messages.menuCount}</span>
              </div>

              <div className="menu-controls">
                <div className="category-list" role="group" aria-label={messages.categoryFilter}>
                  {localizedCategories.map((category) => (
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
                    placeholder={messages.searchPlaceholder}
                    aria-label={messages.searchLabel}
                  />
                  {search && (
                    <button type="button" aria-label={messages.clearSearch} onClick={() => setSearch('')}>
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
                      language={language}
                      messages={messages}
                      onAdd={handleAddClick}
                      onDetails={handleDetails}
                      inCart={cart.some((entry) => entry.item.id === item.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <span>🍲</span>
                  <h3>{messages.noResultsTitle}</h3>
                  <p>{messages.noResultsDescription}</p>
                  <Button variant="secondary" onClick={() => { setSearch(''); setActiveCategory('all') }}>
                    {messages.showAll}
                  </Button>
                </div>
              )}
            </section>

            <footer className="site-footer">
              <div className="footer-contact">
                <strong>{messages.footerContact}</strong>
                <a href="https://zalo.me/0357700838" target="_blank" rel="noreferrer">
                  {messages.footerZalo}
                </a>
                <address>{messages.footerAddress}</address>
              </div>
              <div className="footer-note">
                <span>{messages.footerCopyright}</span>
                <span><Icon name="leaf" size={14} /> {messages.footerFresh}</span>
              </div>
            </footer>
          </main>
        </div>
        {cartPanel}
      </div>
      {mobileCartOpen && <button className="cart-backdrop" aria-label={messages.closeCart} onClick={() => setMobileCartOpen(false)} />}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          item={localizeMenuItem(selectedProduct, language)}
          language={language}
          messages={messages}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}
      {receiptOpen && (
        <section
          className="print-receipt is-open"
          role="dialog"
          aria-modal="true"
          aria-label={messages.receiptLabel}
          onClick={(event) => {
            if (event.target === event.currentTarget) setReceiptOpen(false)
          }}
        >
          <div className="receipt-sheet">
            <header className="print-receipt-header">
              <h1>{language === 'ja' ? 'ベップ・ニャー' : language === 'en' ? 'Bep Nha' : 'Bếp Nhà'}</h1>
              <p>{messages.receiptTitle}</p>
              <time>{orderDate}</time>
            </header>
            <table>
              <thead>
                <tr>
                  <th>{messages.itemName}</th>
                  <th>{messages.quantity}</th>
                  <th>{messages.unitPrice}</th>
                  <th>{messages.lineTotal}</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(({ item, size, quantity }) => {
                  const localizedItem = localizeMenuItem(item, language)
                  const localizedSize = localizedItem.sizes?.find((itemSize) => itemSize.id === size?.id) ?? null
                  return (
                    <tr key={getCartItemKey(item, size)}>
                      <td>
                        {localizedItem.name}
                        {localizedSize && <small className="print-item-size">{localizedSize.name}</small>}
                      </td>
                      <td data-label={messages.quantity}>{quantity}</td>
                      <td data-label={messages.unitPrice}>{formatPrice(getProductPrice(item, size), language)}</td>
                      <td data-label={messages.lineTotal}>{formatPrice(getProductPrice(item, size) * quantity, language)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="print-receipt-total"><span>{messages.total}</span><strong>{formatPrice(subtotal, language)}</strong></p>
            <p className="receipt-hint">{messages.screenshotHint}</p>
            <section className="receipt-payment" aria-label={messages.paymentTitle}>
              <div>
                <h2>{messages.paymentTitle}</h2>
                <p>{messages.scanToPay}</p>
                <div className="receipt-contact">
                  <strong>{messages.ownerName}</strong>
                  <address>{messages.ownerAddress}</address>
                </div>
                <a href="https://zalo.me/0357700838" target="_blank" rel="noreferrer">
                  {messages.zalo}
                </a>
              </div>
              <img src="/payment-qr.png" alt={messages.qrAlt} />
            </section>
            <div className="receipt-actions">
              <Button onClick={printOrder}>{messages.savePdf}</Button>
              <Button variant="secondary" onClick={() => setReceiptOpen(false)}>{messages.closeReceipt}</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
