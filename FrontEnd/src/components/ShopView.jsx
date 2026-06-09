import { useMemo, useState } from 'react';
import AddressLink from './AddressLink.jsx';
import { shortenAddress } from '../utils/location.js';

export default function ShopView({ shops, onBrowseShop, onOpenSidebar }) {
  const [search, setSearch] = useState('');

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return shops;
    return shops.filter((shop) => [shop.name, shop.description, shop.category, shop.address, shop.availability, shop.product?.name]
      .join(' ')
      .toLowerCase()
      .includes(query));
  }, [shops, search]);

  return (
    <section className="view-panel shop-view active-view" aria-label="Shop browsing view">
      <header className="shop-header">
        <button className="mobile-menu-button" type="button" aria-label="Open sidebar" onClick={onOpenSidebar}>
          <span></span><span></span><span></span>
        </button>
        <div>
          <p className="top-kicker">Registered local suppliers</p>
          <h1>Browse Shops</h1>
          <p>Find local suppliers that can match what customers ask Nel-Jay for.</p>
        </div>
      </header>

      <div className="shop-toolbar">
        <label className="shop-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search shop, product, category, address..." />
        </label>
        <span className="shop-count">{filteredShops.length} shop{filteredShops.length === 1 ? '' : 's'}</span>
      </div>

      <div className="shop-grid custom-scrollbar">
        {filteredShops.length === 0 ? (
          <p className="empty-state">No shops found. Try searching another category or product.</p>
        ) : (
          filteredShops.map((shop) => (
            <article className="shop-card" key={shop.id}>
              <div className="shop-image" aria-hidden="true">{shop.icon || '▤'}</div>
              <h3>{shop.name}</h3>
              <p className="shop-description">{shop.description}</p>
              <div className="shop-meta">
                <span className="meta-pill">{shop.category}</span>
                <span className="meta-pill">{shop.availability}</span>
              </div>
              <div className="shop-details-row">
                <span className="shop-rating"><span>★</span> {shop.rating} ({shop.reviews})</span>
                <AddressLink address={shop.address} label={shortenAddress(shop.address, 42)} className="address-link shop-address" />
              </div>
              <button className="view-shop-button" type="button" onClick={() => onBrowseShop(shop)}>Browse Products</button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
