import { useEffect, useMemo, useRef, useState } from 'react'
import type { MenuItem, ProductSize } from './types/menu'
import type { CartItem } from './types/cart'
import { categories, menuItems } from './data/menu'
import { Button } from './components/ui/Button'
import { Icon } from './components/ui/Icon'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HeroSection } from './components/layout/HeroSection'
import { CartSidebar } from './components/layout/CartSidebar'
import { MenuSection } from './features/menu/MenuSection'
import { ProductDetailModal } from './features/menu/ProductDetailModal'
import { getProductPrice } from './utils/menu'
import { formatMessage, formatPrice, translations, type Language } from './i18n'
import { localizeMenuItem } from './utils/localization'
import { isSameCartItem } from './utils/cart'

type BillLine = {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

type SavedBill = {
  id: string
  code: string
  createdAt: string
  total: number
  items: BillLine[]
}

const billsStorageKey = 'bep-nha-bills'

function isSavedBill(value: unknown): value is SavedBill {
  if (typeof value !== 'object' || value === null) return false
  const bill = value as Record<string, unknown>
  return (
    typeof bill.id === 'string' &&
    typeof bill.code === 'string' &&
    typeof bill.createdAt === 'string' &&
    Number.isFinite(bill.total) &&
    Array.isArray(bill.items) &&
    bill.items.every((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false
      const line = item as Record<string, unknown>
      return (
        typeof line.name === 'string' &&
        Number.isInteger(line.quantity) &&
        Number.isFinite(line.unitPrice) &&
        Number.isFinite(line.total)
      )
    })
  )
}

function readSavedBills(): { bills: SavedBill[]; error: boolean } {
  try {
    const storedBills = window.localStorage.getItem(billsStorageKey)
    if (!storedBills) return { bills: [], error: false }

    const parsed: unknown = JSON.parse(storedBills)
    if (!Array.isArray(parsed) || !parsed.every(isSavedBill)) {
      throw new Error('Stored bills have an invalid format')
    }
    return { bills: parsed, error: false }
  } catch (error) {
    console.error('Failed to read locally saved bills', error)
    return { bills: [], error: true }
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
  const [statisticsOpen, setStatisticsOpen] = useState(false)
  const [activeBill, setActiveBill] = useState<SavedBill | null>(null)
  const [initialBillData] = useState(readSavedBills)
  const [savedBills, setSavedBills] = useState<SavedBill[]>(initialBillData.bills)
  const [billStorageError, setBillStorageError] = useState(initialBillData.error)
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
  }).format(activeBill ? new Date(activeBill.createdAt) : new Date())
  const now = new Date()
  const monthlyBills = savedBills.filter((bill) => {
    const billDate = new Date(bill.createdAt)
    return billDate.getFullYear() === now.getFullYear() && billDate.getMonth() === now.getMonth()
  })
  const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.total, 0)
  const totalRevenue = savedBills.reduce((sum, bill) => sum + bill.total, 0)

  useEffect(() => {
    try {
      window.localStorage.setItem(billsStorageKey, JSON.stringify(savedBills))
      setBillStorageError(false)
    } catch (error) {
      console.error('Failed to save bills locally', error)
      setBillStorageError(true)
    }
  }, [savedBills])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = `Bếp Nhà | ${messages.menuTitle}`
  }, [language, messages.menuTitle])

  useEffect(() => {
    if (!selectedProduct && !receiptOpen && !statisticsOpen && !languageMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (receiptOpen) {
          setReceiptOpen(false)
          setActiveBill(null)
        }
        else if (statisticsOpen) setStatisticsOpen(false)
        else if (languageMenuOpen) setLanguageMenuOpen(false)
        else setSelectedProduct(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, receiptOpen, statisticsOpen, languageMenuOpen])

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
      const existing = current.find((entry) => isSameCartItem(entry, canonicalItem, canonicalSize))
      if (existing) {
        return current.map((entry) =>
          isSameCartItem(entry, canonicalItem, canonicalSize)
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
    setCart((current) =>
      current
        .map((entry) =>
          isSameCartItem(entry, item, size)
            ? { ...entry, quantity: entry.quantity + amount }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    )
  }

  function getOrderDocumentData() {
    if (!activeBill) throw new Error('Cannot export a receipt without an active bill')

    return {
      storeName: language === 'ja' ? 'ベップ・ニャー' : language === 'en' ? 'Bep Nha' : 'Bếp Nhà',
      receiptTitle: messages.receiptTitle,
      billCode: activeBill.code,
      date: orderDate,
      itemNumberLabel: messages.itemNumber,
      itemNameLabel: messages.itemName,
      quantityLabel: messages.quantity,
      unitPriceLabel: messages.unitPrice,
      lineTotalLabel: messages.lineTotal,
      totalLabel: messages.total,
      total: formatPrice(activeBill.total, language),
      paymentTitle: messages.paymentTitle,
      scanToPay: messages.scanToPay,
      ownerName: messages.ownerName,
      ownerAddress: messages.ownerAddress,
      zalo: messages.zalo,
      items: activeBill.items.map((item, index) => ({
        number: index + 1,
        name: item.name,
        quantity: item.quantity,
        unitPrice: formatPrice(item.unitPrice, language),
        lineTotal: formatPrice(item.total, language),
      })),
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
      link.download = `${activeBill?.code ?? `don-hang-${fileDate}`}.docx`
      document.body.append(link)
      link.click()
      link.remove()
      setCart([])
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    } catch (error) {
      console.error('Failed to generate order DOCX', error)
      setDocxError(messages.docxExportError)
    } finally {
      setDocxBusy(false)
    }
  }

  async function exportOrderPdfFromDocx() {
    setDocxBusy(true)
    setDocxError(null)
    try {
      const { createOrderPdf } = await import('./utils/order-document')
      const date = new Date()
      const fileDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')
      const pdf = await createOrderPdf(getOrderDocumentData())
      const downloadUrl = URL.createObjectURL(pdf)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${activeBill?.code ?? `don-hang-${fileDate}`}.pdf`
      document.body.append(link)
      link.click()
      link.remove()
      setCart([])
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000)
    } catch (error) {
      console.error('Failed to export order DOCX as PDF', error)
      setDocxError(messages.docxExportError)
    } finally {
      setDocxBusy(false)
    }
  }

  function placeOrder() {
    const createdAt = new Date()
    const monthCode = [
      createdAt.getFullYear(),
      String(createdAt.getMonth() + 1).padStart(2, '0'),
    ].join('')
    const monthSequence = savedBills.filter((bill) => bill.code.includes(`-${monthCode}-`)).length + 1
    const bill: SavedBill = {
      id: crypto.randomUUID(),
      code: `BILL-${monthCode}-${String(monthSequence).padStart(4, '0')}`,
      createdAt: createdAt.toISOString(),
      total: subtotal,
      items: cart.map(({ item, size, quantity }) => {
        const localizedItem = localizeMenuItem(item, language)
        const localizedSize = localizedItem.sizes?.find((itemSize) => itemSize.id === size?.id) ?? null
        const unitPrice = getProductPrice(item, size)
        return {
          name: localizedSize ? `${localizedItem.name} (${localizedSize.name})` : localizedItem.name,
          quantity,
          unitPrice,
          total: unitPrice * quantity,
        }
      }),
    }
    setSavedBills((current) => [...current, bill])
    setActiveBill(bill)
    setMobileCartOpen(false)
    setReceiptOpen(true)
  }

  function closeReceipt() {
    setReceiptOpen(false)
    setActiveBill(null)
  }

  const statsThisMonthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  return (
    <div className={`app-shell${isDark ? ' theme-dark' : ''}`}>
      <div className="site-layout">
        <div className="main-column">
          <Header
            language={language}
            messages={messages}
            isDark={isDark}
            cartCount={cartCount}
            languageMenuOpen={languageMenuOpen}
            languagePickerRef={languagePickerRef}
            onLanguageMenuToggle={() => setLanguageMenuOpen((open) => !open)}
            onLanguageChange={(nextLanguage) => {
              setLanguage(nextLanguage)
              setLanguageMenuOpen(false)
            }}
            onThemeToggle={() => setIsDark((value) => !value)}
            onStatisticsOpen={() => setStatisticsOpen(true)}
            onCartOpen={() => setMobileCartOpen(true)}
          />

          <main>
            <HeroSection messages={messages} />
            <MenuSection
              categories={localizedCategories}
              items={filteredItems}
              cart={cart}
              activeCategory={activeCategory}
              search={search}
              language={language}
              messages={messages}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearch}
              onAdd={handleAddClick}
              onDetails={handleDetails}
              onShowAll={() => {
                setSearch('')
                setActiveCategory('all')
              }}
            />
            <Footer messages={messages} />
          </main>
        </div>
        <CartSidebar
          cart={cart}
          cartCount={cartCount}
          subtotal={subtotal}
          language={language}
          messages={messages}
          mobileCartOpen={mobileCartOpen}
          onClose={() => setMobileCartOpen(false)}
          onQuantityChange={changeQuantity}
          onPlaceOrder={placeOrder}
        />
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
            if (event.target === event.currentTarget) closeReceipt()
          }}
        >
          <div className="receipt-sheet">
            <header className="receipt-header">
              <button
                className="receipt-close-button"
                type="button"
                aria-label={messages.closeReceipt}
                onClick={closeReceipt}
              >
                <Icon name="close" />
              </button>
              <h1>{language === 'ja' ? 'ベップ・ニャー' : language === 'en' ? 'Bep Nha' : 'Bếp Nhà'}</h1>
              <p>{messages.receiptTitle}</p>
              <time>{orderDate}</time>
              {activeBill && (
                <>
                  <p className="receipt-bill-code">{messages.billNumber}: {activeBill.code}</p>
                  <p className="receipt-bill-guid">{messages.billGuid}: {activeBill.id}</p>
                </>
              )}
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
                {activeBill?.items.map((item, index) => {
                  return (
                    <tr key={`${item.name}-${index}`}>
                      <td data-label={messages.itemNumber}>{index + 1}</td>
                      <td>{item.name}</td>
                      <td data-label={messages.quantity}>{item.quantity}</td>
                      <td data-label={messages.unitPrice}>{formatPrice(item.unitPrice, language)}</td>
                      <td data-label={messages.lineTotal}>{formatPrice(item.total, language)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="receipt-total"><span>{messages.total}</span><strong>{formatPrice(activeBill?.total ?? 0, language)}</strong></p>
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
              <Button className="receipt-close-action" variant="secondary" onClick={closeReceipt}>
                {messages.closeReceipt}
              </Button>
            </div>
            <p className="docx-hint">{messages.docxHint}</p>
            <a className="docx-template-link" href="/receipt-template.docx" download>
              {messages.downloadDocxTemplate}
            </a>
            {docxError && <p className="docx-error" role="alert">{docxError}</p>}
          </div>
        </section>
      )}
      {statisticsOpen && (
        <section
          className="receipt-preview is-open"
          role="dialog"
          aria-modal="true"
          aria-label={messages.statistics}
          onClick={(event) => {
            if (event.target === event.currentTarget) setStatisticsOpen(false)
          }}
        >
          <div className="receipt-sheet statistics-sheet">
            <header className="receipt-header">
              <button
                className="receipt-close-button"
                type="button"
                aria-label={messages.closeReceipt}
                onClick={() => setStatisticsOpen(false)}
              >
                <Icon name="close" />
              </button>
              <h1>{messages.statistics}</h1>
              <p>{messages.localStatisticsNotice}</p>
            </header>
            {billStorageError && <p className="docx-error" role="alert">{messages.localStorageError}</p>}
            <div className="statistics-cards">
              <article className="statistics-card">
                <span>{messages.billCount}</span>
                <strong>{savedBills.length}</strong>
              </article>
              <article className="statistics-card">
                <span>{messages.totalRevenue}</span>
                <strong>{formatPrice(totalRevenue, language)}</strong>
              </article>
              <article className="statistics-card">
                <span>{formatMessage(messages.monthlyBillCount, { month: statsThisMonthLabel })}</span>
                <strong>{monthlyBills.length}</strong>
              </article>
              <article className="statistics-card">
                <span>{messages.monthlyRevenue}</span>
                <strong>{formatPrice(monthlyRevenue, language)}</strong>
              </article>
            </div>
            <h2 className="statistics-history-title">{messages.billHistory}</h2>
            {savedBills.length === 0 ? (
              <p className="statistics-empty">{messages.noBillsYet}</p>
            ) : (
              <div className="statistics-history">
                {[...savedBills].reverse().map((bill) => (
                  <article className="statistics-bill" key={bill.id}>
                    <div>
                      <strong>{bill.code}</strong>
                      <time>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(bill.createdAt))}</time>
                      <small>{messages.billGuid}: {bill.id}</small>
                    </div>
                    <strong>{formatPrice(bill.total, language)}</strong>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default App
