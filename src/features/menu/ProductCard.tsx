import type { MenuItem } from '../../types/menu'
import { Button } from '../../components/ui/Button'
import { getProductPrice } from '../../utils/menu'
import { formatMessage, formatPrice, type Language, type Messages } from '../../i18n'

type ProductCardProps = {
  item: MenuItem
  language: Language
  messages: Messages
  onAdd: (item: MenuItem) => void
  onDetails: (item: MenuItem) => void
  inCart: boolean
}

export function ProductCard({ item, language, messages, onAdd, onDetails, inCart }: ProductCardProps) {
  const startingSize = item.sizes?.[0]
  const startingPrice = startingSize?.price ?? item.price
  const finalPrice = getProductPrice(item, startingSize)

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img className="product-image" src={item.image} alt={item.name} loading="lazy" />
        {item.tags?.[0] && <span className={`product-tag${item.popular ? ' product-tag--popular' : ''}`}>{item.tags[0]}</span>}
        {item.discountPercent && <span className="discount-badge">{formatMessage(messages.discount, { percent: item.discountPercent })}</span>}
        <button
          className={`favorite-button${item.popular ? ' is-favorite' : ''}`}
          type="button"
          aria-label={item.popular ? messages.favorite : messages.markFavorite}
          aria-pressed={Boolean(item.popular)}
        >
          ♥
        </button>
      </div>
      <div className="product-content">
        <div className="product-title-row">
          <h3>{item.name}</h3>
          <div className="product-price-group">
            {item.discountPercent && <del>{formatPrice(startingPrice, language)}</del>}
            <strong className={`product-price${item.discountPercent ? ' product-price--discount' : ''}`}>
              {item.sizes?.length ? `${messages.from} ` : ''}
              {formatPrice(finalPrice, language)}
            </strong>
          </div>
        </div>
        <p className="product-description">{item.description}</p>
        <button className="details-link" type="button" onClick={() => onDetails(item)}>
          {messages.details} <span aria-hidden="true">→</span>
        </button>
        <Button
          className={`add-button${inCart ? ' add-button--added' : ''}`}
          variant={inCart ? 'secondary' : 'ghost'}
          onClick={() => onAdd(item)}
          aria-label={formatMessage(messages.addProductToCart, { name: item.name })}
        >
          <span>{item.sizes?.length ? messages.chooseSize : inCart ? messages.addMore : messages.addToCart}</span>
          <span className="add-button-icon">+</span>
        </Button>
      </div>
    </article>
  )
}
