import AddressLink from './AddressLink.jsx';
import { shortenAddress } from '../utils/location.js';

export default function RecommendationDrawer({ isOpen, recommendations, selectedRecommendation, onClose, onShowDetails, onBackToList, onContactSupplier }) {
  const visibleRecommendations = recommendations.filter(Boolean);
  const title = selectedRecommendation ? 'Product details' : 'Recommended shops';

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`recommendation-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <header className="drawer-header">
          <h2>{title}</h2>
          <button className="drawer-close" type="button" onClick={onClose} aria-label="Close recommendations">×</button>
        </header>

        <div className="recommendation-content custom-scrollbar">
          {!selectedRecommendation ? (
            <RecommendationList recommendations={visibleRecommendations} onShowDetails={onShowDetails} />
          ) : (
            <RecommendationDetails shop={selectedRecommendation} onBack={onBackToList} onContactSupplier={onContactSupplier} />
          )}
        </div>
      </aside>
    </>
  );
}

function RecommendationList({ recommendations, onShowDetails }) {
  if (!recommendations.length) {
    return <p className="empty-state">No recommendations available yet.</p>;
  }

  return (
    <>
      <div className="recommendation-summary">
        Nel-Jay found {recommendations.length} local supplier{recommendations.length === 1 ? '' : 's'} that match your request. Select a shop to view the recommended product, exact address, and supplier details.
      </div>
      <div className="recommendation-list">
        {recommendations.map((shop) => (
          <button className="recommendation-card" type="button" key={shop.id} onClick={() => onShowDetails(shop)}>
            <div className="recommendation-thumb" aria-hidden="true">{shop.icon || '▤'}</div>
            <div className="recommendation-info">
              <p className="match-line">{shop.match || shop.category}</p>
              <h3>{shop.name}</h3>
              <p className="one-line">{shop.description}</p>
              <AddressLink address={shop.address} label={shortenAddress(shop.address, 46)} className="address-link recommendation-address" />
              <div className="recommendation-footer">
                <span>★ {shop.rating} ({shop.reviews})</span>
                <span className="view-details-chip">View Details</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function RecommendationDetails({ shop, onBack, onContactSupplier }) {
  const product = shop.product || {};

  return (
    <>
      <div className="drawer-detail-top">
        <button className="drawer-back-button" type="button" onClick={onBack} aria-label="Back to recommendations">‹</button>
        <span className="top-kicker">Back to recommended shops</span>
      </div>

      <div className="supplier-block">
        <p className="top-kicker">Verified Supplier</p>
        <h2>{shop.name}</h2>
        <p>{shop.description}</p>
        <div className="supplier-stats">
          <div className="supplier-stat supplier-address-stat">
            <span>Address</span>
            <strong><AddressLink address={shop.address} label={shop.address} className="address-link drawer-address" /></strong>
          </div>
          <div className="supplier-stat"><span>Status</span><strong>{shop.availability}</strong></div>
          <div className="supplier-stat"><span>Trust</span><strong>★ {shop.rating}</strong></div>
        </div>
      </div>

      <div className="product-preview" aria-hidden="true">{product.imageIcon || shop.icon || '▤'}</div>

      <div className="drawer-product">
        <h3>{product.name || shop.match || 'Recommended item'}</h3>
        <p className="drawer-description">{product.description || 'No product description returned yet.'}</p>
        <div className="drawer-price">
          <span className="current-price">{product.price || 'Price unavailable'}</span>
          {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
        </div>
        <p className="shop-rating"><span>★</span> {product.rating || shop.rating} ({product.reviews || shop.reviews} Reviews)</p>
        <p className="top-kicker">Match Specifications</p>
        <ul className="spec-list">
          {(product.specs || []).map((spec) => <li key={spec}>{spec}</li>)}
        </ul>
        <p className="drawer-description">{product.supplierContact || 'Contact placeholder unavailable.'}</p>
        <button className="contact-button" type="button" onClick={onContactSupplier}>Contact Supplier</button>
      </div>
    </>
  );
}
