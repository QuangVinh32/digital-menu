import type { MenuItem } from '../../types/menu'
import { Button } from '../../components/ui/Button'

type ProductCardProps = {
  item: MenuItem
  onAdd: (item: MenuItem) => void
  inCart: boolean
}

export function ProductCard({ item, onAdd, inCart }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img className="product-image" src={item.image} alt={item.name} loading="lazy" />
        {item.tags?.[0] && <span className={`product-tag${item.popular ? ' product-tag--popular' : ''}`}>{item.tags[0]}</span>}
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
          <strong className="product-price">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</strong>
        </div>
        <p className="product-description">{item.description}</p>
        <Button
          className={`add-button${inCart ? ' add-button--added' : ''}`}
          variant={inCart ? 'secondary' : 'ghost'}
          onClick={() => onAdd(item)}
          aria-label={`Thêm ${item.name} vào giỏ hàng`}
        >
          <span>{inCart ? 'Thêm phần nữa' : 'Thêm vào giỏ'}</span>
          <span className="add-button-icon">+</span>
        </Button>
      </div>
    </article>
  )
}
