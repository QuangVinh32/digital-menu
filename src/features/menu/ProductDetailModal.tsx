import { useState } from 'react'
import type { MenuItem, ProductSize } from '../../types/menu'
import { Button } from '../../components/ui/Button'
import { getProductPrice } from '../../utils/menu'
import { formatMessage, formatPrice, type Language, type Messages } from '../../i18n'

type ProductDetailModalProps = {
  item: MenuItem
  language: Language
  messages: Messages
  onClose: () => void
  onAdd: (item: MenuItem, size: ProductSize | null, quantity: number) => void
}

export function ProductDetailModal({ item, language, messages, onClose, onAdd }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(item.sizes?.[0] ?? null)
  const details = item.details
  const finalPrice = getProductPrice(item, selectedSize)
  const originalPrice = selectedSize?.price ?? item.price

  return (
    <div
      className="product-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button className="product-modal-close" type="button" aria-label={messages.productDialogClose} onClick={onClose}>
          ×
        </button>
        <div className="product-modal-image-wrap">
          <img className="product-modal-image" src={item.image} alt={item.name} />
          {item.tags?.[0] && <span className="product-tag product-modal-tag">{item.tags[0]}</span>}
        </div>
        <div className="product-modal-content">
          <p className="eyebrow">{messages.menuEyebrow}</p>
          <div className="product-modal-title-row">
            <h2 id="product-modal-title">{item.name}</h2>
            <div className="product-modal-price">
              {item.discountPercent && <><span className="discount-inline">{formatMessage(messages.discount, { percent: item.discountPercent })}</span><del>{formatPrice(originalPrice, language)}</del></>}
              <strong className={item.discountPercent ? 'product-price--discount' : ''}>
                {formatPrice(finalPrice, language)}
              </strong>
            </div>
          </div>
          <p className="product-modal-description">{details?.note ?? item.description}</p>

          {item.sizes && item.sizes.length > 0 && (
            <fieldset className="product-size-options">
              <legend>{messages.selectSize}</legend>
              <div>
                {item.sizes.map((size) => (
                  <button
                    className={`product-size-option${selectedSize?.id === size.id ? ' is-selected' : ''}`}
                    type="button"
                    key={size.id}
                    aria-pressed={selectedSize?.id === size.id}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span>{size.name}</span>
                    <strong>{formatPrice(getProductPrice(item, size), language)}</strong>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="product-facts">
            <div><span>◷</span><strong>{details?.preparationTime ?? messages.updating}</strong><small>{messages.preparation}</small></div>
            <div><span>♨</span><strong>{details?.calories ? `${details.calories} kcal` : messages.updating}</strong><small>{messages.calories}</small></div>
            <div><span>◎</span><strong>{details?.serving ?? messages.updating}</strong><small>{messages.serving}</small></div>
          </div>

          <div className="product-ingredients">
            <h3>{messages.ingredients}</h3>
            {details?.ingredients.length ? (
              <ul>
                {details.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            ) : (
              <p>{messages.ingredientUpdating}</p>
            )}
          </div>

          <div className="product-modal-footer">
            <div className="quantity-control modal-quantity" aria-label={messages.chooseQuantity}>
              <button
                type="button"
                aria-label={messages.decreaseQuantity}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button type="button" aria-label={messages.increaseQuantity} onClick={() => setQuantity((current) => current + 1)}>
                +
              </button>
            </div>
            <Button
              className="modal-add-button"
              onClick={() => {
                onAdd(item, selectedSize, quantity)
                onClose()
              }}
            >
              {formatMessage(messages.addToCartWithPrice, { price: formatPrice(finalPrice * quantity, language) })}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
