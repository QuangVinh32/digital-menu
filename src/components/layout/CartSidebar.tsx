import type { CartItem } from '../../types/cart'
import type { Language, Messages } from '../../i18n'
import { formatMessage, formatPrice } from '../../i18n'
import { localizeMenuItem } from '../../utils/localization'
import { getCartItemKey } from '../../utils/cart'
import { getProductPrice } from '../../utils/menu'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

type CartSidebarProps = {
  cart: CartItem[]
  cartCount: number
  subtotal: number
  language: Language
  messages: Messages
  mobileCartOpen: boolean
  onClose: () => void
  onQuantityChange: (item: CartItem['item'], size: CartItem['size'], amount: number) => void
  onPlaceOrder: () => void
}

export function CartSidebar({
  cart,
  cartCount,
  subtotal,
  language,
  messages,
  mobileCartOpen,
  onClose,
  onQuantityChange,
  onPlaceOrder,
}: CartSidebarProps) {
  return (
    <aside className={`cart-panel${mobileCartOpen ? ' cart-panel--open' : ''}`} aria-label={messages.cartTitle}>
      <div className="cart-heading">
        <div>
          <p className="eyebrow">{messages.cartHeading}</p>
          <h2>{messages.cartTitle} <span className="cart-count">{cartCount}</span></h2>
        </div>
        <button className="icon-button cart-close" type="button" aria-label={messages.closeCart} onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon"><Icon name="cart" size={26} /></div>
          <h3>{messages.emptyCartTitle}</h3>
          <p>{messages.emptyCartDescription}</p>
          <Button variant="secondary" onClick={onClose}>{messages.browseMenu}</Button>
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
                      <button type="button" aria-label={formatMessage(messages.decrease, { name: localizedItem.name })} onClick={() => onQuantityChange(item, size, -1)}>
                        <Icon name="minus" size={15} />
                      </button>
                      <span>{quantity}</span>
                      <button type="button" aria-label={formatMessage(messages.increase, { name: localizedItem.name })} onClick={() => onQuantityChange(item, size, 1)}>
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
            <Button className="checkout-button" onClick={onPlaceOrder}>
              {messages.placeOrder} <Icon name="arrow" size={18} />
            </Button>
            <p className="cart-note">{messages.cartNote}</p>
          </div>
        </>
      )}
    </aside>
  )
}
