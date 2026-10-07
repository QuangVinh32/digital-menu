import { useState } from 'react'
import type { MenuItem } from '../../types/menu'
import { Button } from '../../components/ui/Button'
import { getProductPrice } from '../../utils/menu'

type ProductDetailModalProps = {
  item: MenuItem
  onClose: () => void
  onAdd: (item: MenuItem, quantity: number) => void
}

export function ProductDetailModal({ item, onClose, onAdd }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const details = item.details
  const finalPrice = getProductPrice(item)

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
        <button className="product-modal-close" type="button" aria-label="Đóng chi tiết món" onClick={onClose}>
          ×
        </button>
        <div className="product-modal-image-wrap">
          <img className="product-modal-image" src={item.image} alt={item.name} />
          {item.tags?.[0] && <span className="product-tag product-modal-tag">{item.tags[0]}</span>}
        </div>
        <div className="product-modal-content">
          <p className="eyebrow">BẾP NHÀ GỢI Ý</p>
          <div className="product-modal-title-row">
            <h2 id="product-modal-title">{item.name}</h2>
            <div className="product-modal-price">
              {item.discountPercent && <><span className="discount-inline">-{item.discountPercent}%</span><del>{new Intl.NumberFormat('vi-VN').format(item.price)}đ</del></>}
              <strong className={item.discountPercent ? 'product-price--discount' : ''}>
                {new Intl.NumberFormat('vi-VN').format(finalPrice)}đ
              </strong>
            </div>
          </div>
          <p className="product-modal-description">{details?.note ?? item.description}</p>

          <div className="product-facts">
            <div><span>◷</span><strong>{details?.preparationTime ?? 'Đang cập nhật'}</strong><small>Chuẩn bị</small></div>
            <div><span>♨</span><strong>{details?.calories ? `${details.calories} kcal` : 'Đang cập nhật'}</strong><small>Năng lượng</small></div>
            <div><span>◎</span><strong>{details?.serving ?? 'Đang cập nhật'}</strong><small>Khẩu phần</small></div>
          </div>

          <div className="product-ingredients">
            <h3>Thành phần</h3>
            {details?.ingredients.length ? (
              <ul>
                {details.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            ) : (
              <p>Thông tin thành phần đang được cập nhật.</p>
            )}
          </div>

          <div className="product-modal-footer">
            <div className="quantity-control modal-quantity" aria-label="Chọn số lượng">
              <button
                type="button"
                aria-label="Giảm số lượng"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button type="button" aria-label="Tăng số lượng" onClick={() => setQuantity((current) => current + 1)}>
                +
              </button>
            </div>
            <Button
              className="modal-add-button"
              onClick={() => {
                onAdd(item, quantity)
                onClose()
              }}
            >
              Thêm vào giỏ · {new Intl.NumberFormat('vi-VN').format(finalPrice * quantity)}đ
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
