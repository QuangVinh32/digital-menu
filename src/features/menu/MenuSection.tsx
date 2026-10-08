import type { MenuCategory, MenuItem } from '../../types/menu'
import type { CartItem } from '../../types/cart'
import type { Language, Messages } from '../../i18n'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Input'
import { ProductCard } from './ProductCard'

type MenuSectionProps = {
  categories: MenuCategory[]
  items: MenuItem[]
  cart: CartItem[]
  activeCategory: string
  search: string
  language: Language
  messages: Messages
  onCategoryChange: (categoryId: string) => void
  onSearchChange: (value: string) => void
  onAdd: (item: MenuItem) => void
  onDetails: (item: MenuItem) => void
  onShowAll: () => void
}

export function MenuSection({
  categories,
  items,
  cart,
  activeCategory,
  search,
  language,
  messages,
  onCategoryChange,
  onSearchChange,
  onAdd,
  onDetails,
  onShowAll,
}: MenuSectionProps) {
  return (
    <section className="menu-section" aria-labelledby="menu-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{messages.menuEyebrow}</p>
          <h2 id="menu-title">{messages.menuTitle}</h2>
        </div>
        <span className="menu-count">{items.length} {messages.menuCount}</span>
      </div>

      <div className="menu-controls">
        <div className="category-list" role="group" aria-label={messages.categoryFilter}>
          {categories.map((category) => (
            <button
              className={`category-button${activeCategory === category.id ? ' is-active' : ''}`}
              type="button"
              key={category.id}
              aria-pressed={activeCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Icon name="search" size={18} />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={messages.searchPlaceholder}
            aria-label={messages.searchLabel}
          />
          {search && (
            <button type="button" aria-label={messages.clearSearch} onClick={() => onSearchChange('')}>
              <Icon name="close" size={16} />
            </button>
          )}
        </label>
      </div>

      {items.length > 0 ? (
        <div className="product-grid">
          {items.map((item) => (
            <ProductCard
              item={item}
              key={item.id}
              language={language}
              messages={messages}
              onAdd={onAdd}
              onDetails={onDetails}
              inCart={cart.some((entry) => entry.item.id === item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <span>🍲</span>
          <h3>{messages.noResultsTitle}</h3>
          <p>{messages.noResultsDescription}</p>
          <Button variant="secondary" onClick={onShowAll}>{messages.showAll}</Button>
        </div>
      )}
    </section>
  )
}
