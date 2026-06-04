import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '../utils/format.js'

const ProductCard = ({ product, onAction, actionLabel = 'View listing' }) => (
  <article className="card fade-in listing-card">
    <Link to={`/products/${product.id}`} className="listing-card__media">
      <div
        className="listing-card__image"
        style={{ background: product.image?.bg || 'linear-gradient(135deg, #dce9ff, #edf5ff)' }}
      >
        {product.image?.url ? (
          <img src={product.image.url} alt={product.image?.alt || product.name} />
        ) : (
          <span className="product-mark">{product.image?.label || 'CS'}</span>
        )}
      </div>
    </Link>

    <div className="listing-card__body">
      <div className="listing-card__header">
        <span className="pill">{product.category || product.size || 'Campus item'}</span>
        <span className="status-pill">{product.condition || 'Good'}</span>
      </div>

      <Link to={`/products/${product.id}`} className="listing-card__title-link">
        <h3>{product.name}</h3>
      </Link>

      <p className="muted">{product.description}</p>

      <div className="listing-card__meta">
        <span>{product.campus || 'Campus pickup'}</span>
        <span>{product.sellerName || 'Student seller'}</span>
      </div>

      <div className="listing-card__footer">
        <strong>{formatCurrency(product.price)}</strong>
        <div className="listing-card__actions">
          <Link to={`/products/${product.id}`} className="button ghost small">
            Open
          </Link>
          {onAction && (
            <button className="button small" onClick={() => onAction(product)}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {product.createdAt && <p className="muted listing-card__timestamp">Posted {formatDate(product.createdAt)}</p>}
    </div>
  </article>
)

export default ProductCard
