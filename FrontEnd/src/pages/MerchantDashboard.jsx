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

  useEffect(() => {
    loadBranches();
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

  async function loadCatalog(branchId) {
    if (branchCatalog[branchId]) return;
    setError('');
    try {
      const [supplies, services] = await Promise.all([getBranchSupplies(branchId), getBranchServices(branchId)]);
      setBranchCatalog((prev) => ({
        ...prev,
        [branchId]: {
          supplies: supplies.data || [],
          services: services.data || []
        }
      }));
    } catch (err) {
      setError(err.message || 'Failed to load branch catalog.');
    }
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
      setBranchCatalog({});
      await loadCatalog(payload.branchId);
    } catch (err) {
      setError(err.message || 'Failed to add item.');
    }
  }

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

      <div className="dashboard-list">
        {activeTab === 'branches' && branches.map((branch) => <BranchRow key={branch._id} branch={branch} />)}
        {activeTab !== 'branches' && branches.map((branch) => (
          <CatalogGroup key={branch._id} branch={branch} type={activeTab} catalog={branchCatalog[branch._id]} onLoad={() => loadCatalog(branch._id)} />
        ))}
      </div>

      {modal === 'branch' && <BranchModal onClose={() => setModal(null)} onSubmit={handleAddBranch} />}
      {(modal === 'products' || modal === 'services') && <ItemModal type={modal} branches={branches} onClose={() => setModal(null)} onSubmit={handleAddItem} />}
    </section>
  );
}

function BranchRow({ branch }) {
  const coords = branch.location?.coordinates || [];
  return (
    <article className="dashboard-row">
      <div>
        <h3>
          {branch.branchName}</h3>
        <p>
          {branch.contactNumber || 'No contact number'}</p>
        <p>Coordinates: {coords.join(', ') || 'Not available'}</p>
      </div>
      <span className="meta-pill">Active</span>
    </article>
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
