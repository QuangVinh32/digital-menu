import { useEffect, useMemo, useRef, useState } from 'react'
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

const languageOptions = [
  { code: 'vi', flag: 'vi', label: 'Tiếng Việt' },
  { code: 'en', flag: 'en', label: 'English' },
  { code: 'ja', flag: 'ja', label: '日本語' },
] as const

function FlagIcon({ country }: { country: (typeof languageOptions)[number]['flag'] }) {
  return (
    <svg className="flag-icon" viewBox="0 0 30 20" aria-hidden="true">
      {country === 'vi' && (
        <>
          <rect width="30" height="20" fill="#da251d" />
          <path d="m15 3 1.45 4.47h4.7l-3.8 2.76 1.45 4.47L15 11.94l-3.8 2.76 1.45-4.47-3.8-2.76h4.7z" fill="#ff0" />
        </>
      )}
      {country === 'en' && (
        <>
          <rect width="30" height="20" fill="#012169" />
          <path d="m0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4.5" />
          <path d="m0 0 30 20M30 0 0 20" stroke="#c8102e" strokeWidth="1.8" />
          <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="7" />
          <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.5" />
        </>
      )}
      {country === 'ja' && (
        <>
          <rect width="30" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="6" fill="#bc002d" />
        </>
      )}
    </svg>
  )
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
  const [docxBusy, setDocxBusy] = useState(false)
  const [docxError, setDocxError] = useState<string | null>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null)
  const languagePickerRef = useRef<HTMLDivElement>(null)
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
    if (!selectedProduct && !receiptOpen && !languageMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (receiptOpen) setReceiptOpen(false)
        else if (languageMenuOpen) setLanguageMenuOpen(false)
        else setSelectedProduct(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, receiptOpen, languageMenuOpen])

  useEffect(() => {
    if (!languageMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !languagePickerRef.current?.contains(event.target)) {
        setLanguageMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [languageMenuOpen])

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

  function getOrderDocumentData() {
    return {
      storeName: language === 'ja' ? 'ベップ・ニャー' : language === 'en' ? 'Bep Nha' : 'Bếp Nhà',
      receiptTitle: messages.receiptTitle,
      date: orderDate,
      itemNumberLabel: messages.itemNumber,
      itemNameLabel: messages.itemName,
      quantityLabel: messages.quantity,
      unitPriceLabel: messages.unitPrice,
      lineTotalLabel: messages.lineTotal,
      totalLabel: messages.total,
      total: formatPrice(subtotal, language),
      paymentTitle: messages.paymentTitle,
      scanToPay: messages.scanToPay,
      ownerName: messages.ownerName,
      ownerAddress: messages.ownerAddress,
      zalo: messages.zalo,
      items: cart.map(({ item, size, quantity }, index) => {
        const localizedItem = localizeMenuItem(item, language)
        const localizedSize = localizedItem.sizes?.find((itemSize) => itemSize.id === size?.id) ?? null
        return {
          number: index + 1,
          name: localizedSize ? `${localizedItem.name} (${localizedSize.name})` : localizedItem.name,
          quantity,
          unitPrice: formatPrice(getProductPrice(item, size), language),
          lineTotal: formatPrice(getProductPrice(item, size) * quantity, language),
        }
      }),
    }
  }

  async function downloadOrderDocx() {
    setDocxBusy(true)
    setDocxError(null)
    try {
      const { fillOrderDocumentTemplate } = await import('./utils/order-document')
      const blob = await fillOrderDocumentTemplate(getOrderDocumentData())
      const date = new Date()
      const fileDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `don-hang-${fileDate}.docx`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    } catch (error) {
      console.error('Failed to generate order DOCX', error)
      setDocxError(messages.docxExportError)
    } finally {
      setDocxBusy(false)
    }
  }

  async function exportOrderPdfFromDocx() {
    const printFrame = document.createElement('iframe')
    printFrame.title = messages.exportPdfFromDocx
    printFrame.style.position = 'fixed'
    printFrame.style.left = '-10000px'
    printFrame.style.width = '80mm'
    printFrame.style.height = '150mm'
    printFrame.style.border = '0'
    document.body.append(printFrame)
    const printWindow = printFrame.contentWindow
    if (!printWindow) {
      printFrame.remove()
      setDocxError(messages.docxExportError)
      return
    }

    setDocxBusy(true)
    setDocxError(null)
    try {
      const { printOrderDocumentAsPdf } = await import('./utils/order-document')
      const date = new Date()
      const fileDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')
      await printOrderDocumentAsPdf(getOrderDocumentData(), printWindow, `don-hang-${fileDate}`)
    } catch (error) {
      printFrame.remove()
      console.error('Failed to export order DOCX as PDF', error)
      setDocxError(messages.docxExportError)
    } finally {
      setDocxBusy(false)
    }
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
              <div className="language-picker" ref={languagePickerRef}>
                <button
                  className="language-picker-trigger"
                  type="button"
                  aria-label={`${messages.languageLabel}: ${languageOptions.find((option) => option.code === language)?.label}`}
                  aria-expanded={languageMenuOpen}
                  aria-controls="language-menu"
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                >
                  <FlagIcon country={language} />
                </button>
                {languageMenuOpen && (
                  <div className="language-menu" id="language-menu" role="group" aria-label={messages.languageLabel}>
                    {languageOptions.map((option) => (
                      <button
                        className="language-menu-option"
                        type="button"
                        aria-pressed={language === option.code}
                        key={option.code}
                        onClick={() => {
                          setLanguage(option.code)
                          setLanguageMenuOpen(false)
                        }}
                      >
                        <FlagIcon country={option.flag} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                <img
                  className="hero-food-image"
                  src={menuItems[0].image}
                  alt=""
                  fetchPriority="high"
                />
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
          className="receipt-preview is-open"
          role="dialog"
          aria-modal="true"
          aria-label={messages.receiptLabel}
          onClick={(event) => {
            if (event.target === event.currentTarget) setReceiptOpen(false)
          }}
        >
          <div style={{borderRadius:"0"}} className="receipt-sheet">
            <header className="receipt-header">
              <h1>{language === 'ja' ? 'ベップ・ニャー' : language === 'en' ? 'Bep Nha' : 'Bếp Nhà'}</h1>
              <p>{messages.receiptTitle}</p>
              <time>{orderDate}</time>
            </header>
            <table>
              <thead>
                <tr>
                  <th>{messages.itemNumber}</th>
                  <th>{messages.itemName}</th>
                  <th>{messages.quantity}</th>
                  <th>{messages.unitPrice}</th>
                  <th>{messages.lineTotal}</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(({ item, size, quantity }, index) => {
                  const localizedItem = localizeMenuItem(item, language)
                  const localizedSize = localizedItem.sizes?.find((itemSize) => itemSize.id === size?.id) ?? null
                  return (
                    <tr key={getCartItemKey(item, size)}>
                      <td data-label={messages.itemNumber}>{index + 1}</td>
                      <td>
                        {localizedItem.name}
                        {localizedSize && <small className="receipt-item-size">{localizedSize.name}</small>}
                      </td>
                      <td data-label={messages.quantity}>{quantity}</td>
                      <td data-label={messages.unitPrice}>{formatPrice(getProductPrice(item, size), language)}</td>
                      <td data-label={messages.lineTotal}>{formatPrice(getProductPrice(item, size) * quantity, language)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="receipt-total"><span>{messages.total}</span><strong>{formatPrice(subtotal, language)}</strong></p>
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
              <Button onClick={downloadOrderDocx} disabled={docxBusy}>
                {docxBusy ? messages.docxExporting : messages.saveDocx}
              </Button>
              <Button onClick={exportOrderPdfFromDocx} disabled={docxBusy}>
                {docxBusy ? messages.pdfExporting : messages.exportPdfFromDocx}
              </Button>
              <Button variant="secondary" onClick={() => setReceiptOpen(false)}>{messages.closeReceipt}</Button>
            </div>
            <p className="docx-hint">{messages.docxHint}</p>
            <a className="docx-template-link" href="/receipt-template.docx" download>
              {messages.downloadDocxTemplate}
            </a>
            {docxError && <p className="docx-error" role="alert">{docxError}</p>}
          </div>
        </section>
      )}
    </div>
  )
}

export default App
