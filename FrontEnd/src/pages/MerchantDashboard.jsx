import { useEffect, useState } from 'react';
import { addServiceItem, addSupplyItem, createBranch, getBranchServices, getBranchSupplies, getMyBranches } from '../services/catalogService.js';

export default function MerchantDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('branches');
  const [branches, setBranches] = useState([]);
  const [branchCatalog, setBranchCatalog] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedProductBranch, setSelectedProductBranch] = useState(null);
  const [isProductModalLoading, setIsProductModalLoading] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape') return;
      setSelectedProductBranch(null);
      setModal(null);
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  async function loadBranches() {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyBranches();
      setBranches(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load branches.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCatalog(branchId, forceRefresh = false) {
    if (!forceRefresh && branchCatalog[branchId]) return branchCatalog[branchId];
    setError('');
    try {
      const [supplies, services] = await Promise.all([getBranchSupplies(branchId), getBranchServices(branchId)]);
      const nextCatalog = {
        supplies: supplies.data || [],
        services: services.data || []
      };
      setBranchCatalog((prev) => ({
        ...prev,
        [branchId]: nextCatalog
      }));
      return nextCatalog;
    } catch (err) {
      setError(err.message || 'Failed to load branch catalog.');
      return null;
    }
  }

  async function openProductBranchModal(branch) {
    setSelectedProductBranch(branch);
    setIsProductModalLoading(true);
    await loadCatalog(branch._id);
    setIsProductModalLoading(false);
  }

  async function handleAddBranch(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createBranch({
        branchName: form.get('branchName'),
        contactNumber: form.get('contactNumber'),
        longitude: form.get('longitude'),
        latitude: form.get('latitude')
      });
      setSuccess('Branch added successfully.');
      setModal(null);
      loadBranches();
    } catch (err) {
      setError(err.message || 'Failed to add branch.');
    }
  }

  async function handleAddItem(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = form.get('type');
    const payload = {
      branchId: form.get('branchId'),
      name: form.get('name'),
      price: Number(form.get('price'))
    };

    try {
      if (type === 'products') await addSupplyItem(payload);
      else await addServiceItem(payload);
      setSuccess(`${type === 'products' ? 'Product' : 'Service'} added successfully.`);
      setModal(null);
      await loadCatalog(payload.branchId, true);
    } catch (err) {
      setError(err.message || 'Failed to add item.');
    }
  }

  const selectedBranchProducts = selectedProductBranch ? branchCatalog[selectedProductBranch._id]?.supplies || [] : [];

  return (
    <section className="merchant-dashboard">
      <header className="dashboard-hero">
        <div className="dashboard-avatar">{user?.name?.[0]?.toUpperCase() || 'N'}</div>
        <div>
          <p className="top-kicker">Merchant Dashboard</p>
          <h1>{user?.businessId?.companyName || user?.name || 'Business Portal'}</h1>
          <p>Manage branches, products, and services that power Nel-Jay recommendations.</p>
        </div>
      </header>

      <nav className="dashboard-tabs">
        {['branches', 'products', 'services'].map((tab) => (
          <button className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>

      <div className="dashboard-action-row">
        {activeTab === 'branches' ? (
          <button className="view-shop-button dashboard-add" onClick={() => setModal('branch')}>Add Branch</button>
        ) : (
          <button className="view-shop-button dashboard-add" onClick={() => setModal(activeTab)}>Add {activeTab === 'products' ? 'Product' : 'Service'}</button>
        )}
      </div>

      {error && <p className="dashboard-message error">{error}</p>}
      {success && <p className="dashboard-message success">{success}</p>}
      {isLoading && <p className="empty-state">Loading business data...</p>}

      <div className={activeTab === 'products' ? 'dashboard-list product-branch-grid' : 'dashboard-list'}>
        {activeTab === 'branches' && branches.map((branch) => <BranchRow key={branch._id} branch={branch} />)}

        {activeTab === 'products' && branches.map((branch) => (
          <ProductBranchCard
            key={branch._id}
            branch={branch}
            productCount={branchCatalog[branch._id]?.supplies?.length}
            onOpen={() => openProductBranchModal(branch)}
          />
        ))}

        {activeTab === 'services' && branches.map((branch) => (
          <CatalogGroup key={branch._id} branch={branch} type={activeTab} catalog={branchCatalog[branch._id]} onLoad={() => loadCatalog(branch._id)} />
        ))}

        {!isLoading && branches.length === 0 && (
          <p className="empty-state">No branches yet. Add a branch before creating products or services.</p>
        )}
      </div>

      {modal === 'branch' && <BranchModal onClose={() => setModal(null)} onSubmit={handleAddBranch} />}
      {(modal === 'products' || modal === 'services') && <ItemModal type={modal} branches={branches} onClose={() => setModal(null)} onSubmit={handleAddItem} />}

      {selectedProductBranch && (
        <ProductBranchModal
          branch={selectedProductBranch}
          products={selectedBranchProducts}
          isLoading={isProductModalLoading}
          onClose={() => setSelectedProductBranch(null)}
          onAddProduct={() => {
            setSelectedProductBranch(null);
            setModal('products');
          }}
        />
      )}
    </section>
  );
}

function BranchRow({ branch }) {
  const coords = branch.location?.coordinates || [];
  return (
    <article className="dashboard-row">
      <div>
        <h3>{branch.branchName}</h3>
        <p>{branch.contactNumber || 'No contact number'}</p>
        <p>Coordinates: {coords.join(', ') || 'Not available'}</p>
      </div>
      <span className="meta-pill">Active</span>
    </article>
  );
}

function ProductBranchCard({ branch, productCount, onOpen }) {
  const coords = branch.location?.coordinates || [];
  return (
    <button className="product-branch-card" type="button" onClick={onOpen}>
      <div className="product-branch-card__icon" aria-hidden="true">▤</div>
      <div className="product-branch-card__content">
        <p className="top-kicker">Product Branch</p>
        <h3>{branch.branchName}</h3>
        <p>{branch.contactNumber || 'No contact number available'}</p>
        <p className="product-branch-card__meta">Coordinates: {coords.join(', ') || 'Not available'}</p>
      </div>
      <div className="product-branch-card__footer">
        <span className="meta-pill">{typeof productCount === 'number' ? `${productCount} product${productCount === 1 ? '' : 's'}` : 'View products'}</span>
        <span className="product-branch-card__arrow">→</span>
      </div>
    </button>
  );
}

function CatalogGroup({ branch, type, catalog, onLoad }) {
  const items = type === 'products' ? catalog?.supplies : catalog?.services;
  return (
    <article className="dashboard-row catalog-group" onClick={onLoad}>
      <div>
        <h3>{branch.branchName}</h3>
        {!items ? <p>Click to load {type}.</p> : items.length ? items.map((item) => <p key={item._id}>{item.name} — ₱{Number(item.price).toLocaleString('en-PH')}</p>) : <p>No {type} yet.</p>}
      </div>
      <span className="meta-pill">{items?.length ?? 'Load'}</span>
    </article>
  );
}

function ProductBranchModal({ branch, products, isLoading, onClose, onAddProduct }) {
  const coords = branch.location?.coordinates || [];

  return (
    <div className="product-glass-overlay" onClick={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <section className="product-glass-modal" role="dialog" aria-modal="true" aria-labelledby="productBranchModalTitle">
        <header className="product-glass-modal__header">
          <div>
            <p className="top-kicker">Branch Products</p>
            <h2 id="productBranchModalTitle">{branch.branchName}</h2>
            <p>{branch.contactNumber || 'No contact number available'}{coords.length ? ` • Coordinates: ${coords.join(', ')}` : ''}</p>
          </div>
          <button className="drawer-close" type="button" onClick={onClose} aria-label="Close product branch modal">×</button>
        </header>

        <div className="product-glass-modal__toolbar">
          <span>{products.length} product{products.length === 1 ? '' : 's'} listed in this branch</span>
          <button className="view-shop-button product-modal-add-button" type="button" onClick={onAddProduct}>Add Product</button>
        </div>

        <div className="product-card-grid custom-scrollbar">
          {isLoading ? (
            <p className="product-modal-empty">Loading products for this branch...</p>
          ) : products.length ? (
            products.map((product) => <ProductCard key={product._id || product.id || product.name} product={product} />)
          ) : (
            <div className="product-modal-empty">
              <div className="product-modal-empty__icon">▤</div>
              <h3>No products yet</h3>
              <p>This branch does not have products assigned yet. Add a product so it can appear in Nel-Jay recommendations.</p>
              <button className="view-shop-button product-modal-add-button" type="button" onClick={onAddProduct}>Add First Product</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  const price = Number(product.price || 0).toLocaleString('en-PH');
  const category = product.category || product.metadata?.category || 'Product';
  const status = product.status || product.stockStatus || 'Available';
  const description = product.description || product.textChunk || 'No product description available yet.';

  return (
    <article className="product-modal-card">
      <div className="product-modal-card__image" aria-hidden="true">{product.imageIcon || '▤'}</div>
      <div className="product-modal-card__body">
        <div className="product-modal-card__topline">
          <span className="meta-pill">{category}</span>
          <span className="product-status-chip">{status}</span>
        </div>
        <h3>{product.name || 'Unnamed product'}</h3>
        <p>{description}</p>
      </div>
      <div className="product-modal-card__footer">
        <strong>₱{price}</strong>
        <button className="product-card-action" type="button">View</button>
      </div>
    </article>
  );
}

function BranchModal({ onClose, onSubmit }) {
  return (
    <div className="settings-modal open" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <form className="settings-panel modal-form" onSubmit={onSubmit}>
        <div className="settings-header"><h2>Add Branch</h2><button type="button" className="drawer-close" onClick={onClose}>×</button></div>
        <input name="branchName" placeholder="Branch name" required />
        <input name="contactNumber" placeholder="Contact number" />
        <input name="longitude" placeholder="Longitude" required />
        <input name="latitude" placeholder="Latitude" required />
        <button className="auth-submit" type="submit">Save Branch</button>
      </form>
    </div>
  );
}

function ItemModal({ type, branches, onClose, onSubmit }) {
  return (
    <div className="settings-modal open" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <form className="settings-panel modal-form" onSubmit={onSubmit}>
        <div className="settings-header"><h2>Add {type === 'products' ? 'Product' : 'Service'}</h2><button type="button" className="drawer-close" onClick={onClose}>×</button></div>
        <input type="hidden" name="type" value={type} />
        <select name="branchId" required>
          <option value="">Select branch</option>
          {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.branchName}</option>)}
        </select>
        <input name="name" placeholder="Name" required />
        <input name="price" type="number" min="0" placeholder="Price" required />
        <button className="auth-submit" type="submit">Save {type === 'products' ? 'Product' : 'Service'}</button>
      </form>
    </div>
  );
}
