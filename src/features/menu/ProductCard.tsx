import type { MenuItem } from '../../types/menu'
import { Button } from '../../components/ui/Button'
import { getProductPrice } from '../../utils/menu'

type ProductCardProps = {
  item: MenuItem
  onAdd: (item: MenuItem) => void
  onDetails: (item: MenuItem) => void
  inCart: boolean
}

export function ProductCard({ item, onAdd, onDetails, inCart }: ProductCardProps) {
  const startingSize = item.sizes?.[0]
  const startingPrice = startingSize?.price ?? item.price
  const finalPrice = getProductPrice(item, startingSize)

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img className="product-image" src={item.image} alt={item.name} loading="lazy" />
        {item.tags?.[0] && <span className={`product-tag${item.popular ? ' product-tag--popular' : ''}`}>{item.tags[0]}</span>}
        {item.discountPercent && <span className="discount-badge">-{item.discountPercent}%</span>}
        <button
          className={`favorite-button${item.popular ? ' is-favorite' : ''}`}
          type="button"
          aria-label={item.popular ? 'Món được yêu thích' : 'Đánh dấu món yêu thích'}
          aria-pressed={Boolean(item.popular)}
        >
          ♥
        </button>
      </div>
      <div className="product-content">
        <div className="product-title-row">
          <h3>{item.name}</h3>
          <div className="product-price-group">
            {item.discountPercent && <del>{new Intl.NumberFormat('vi-VN').format(startingPrice)}đ</del>}
            <strong className={`product-price${item.discountPercent ? ' product-price--discount' : ''}`}>
              {item.sizes?.length ? 'Từ ' : ''}
              {new Intl.NumberFormat('vi-VN').format(finalPrice)}đ
            </strong>
          </div>
        </div>
        <p className="product-description">{item.description}</p>
        <button className="details-link" type="button" onClick={() => onDetails(item)}>
          Xem chi tiết <span aria-hidden="true">→</span>
        </button>
        <Button
          className={`add-button${inCart ? ' add-button--added' : ''}`}
          variant={inCart ? 'secondary' : 'ghost'}
          onClick={() => onAdd(item)}
          aria-label={`Thêm ${item.name} vào giỏ hàng`}
        >
          <span>{item.sizes?.length ? 'Chọn size' : inCart ? 'Thêm phần nữa' : 'Thêm vào giỏ'}</span>
          <span className="add-button-icon">+</span>
        </Button>
      </div>
    </article>
  )
}
