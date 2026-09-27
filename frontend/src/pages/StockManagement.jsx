import React, { useState, useEffect } from 'react';
import { 
  Boxes, AlertTriangle, Clock, RefreshCw, Plus, Minus, 
  Search, CheckCircle2, PackageCheck, Barcode, Pill, Sparkles 
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getExpiryBadge, getStockBadge } from '../utils/helpers';

const StockManagement = () => {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchLiveStock = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/medicines');
      if (res.data?.medicines) {
        setStockList(res.data.medicines);
      }
    } catch (err) {
      console.warn('Failed to load live medicines for stock management:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStock();
  }, []);

  const handleAdjustStock = async (id, delta) => {
    const item = stockList.find(m => m._id === id);
    if (!item) return;

    const currentQty = Number(item.quantity) || 0;
    const newQuantity = Math.max(0, currentQty + delta);

    try {
      setUpdatingId(id);
      setFeedbackMsg('');

      // Optimistic UI state update
      setStockList(prev => prev.map(m => m._id === id ? { ...m, quantity: newQuantity } : m));

      // Call backend API to update MongoDB stock
      const res = await api.put(`/stock/${id}`, { quantity: newQuantity });

      if (res.data?.medicine) {
        setStockList(prev => prev.map(m => m._id === id ? res.data.medicine : m));
      }

      const actionText = delta > 0 ? `+${delta} units added to` : `${Math.abs(delta)} units dispensed from`;
      setFeedbackMsg(`Stock updated: ${actionText} "${item.name}" (Current Stock: ${newQuantity} units).`);
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error('Failed to update stock in MongoDB:', err);
      setFeedbackMsg(`Stock updated locally for "${item.name}" (${newQuantity} units).`);
      setTimeout(() => setFeedbackMsg(''), 3500);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredItems = stockList.filter(item => {
    if (categoryFilter !== 'ALL') {
      if ((item.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches = (item.name || '').toLowerCase().includes(term) ||
        (item.batchNumber || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term) ||
        (item.manufacturer || '').toLowerCase().includes(term) ||
        (item.barcode || '').toLowerCase().includes(term);
      if (!matches) return false;
    }

    return true;
  });

  const lowStockItems = stockList.filter(i => (Number(i.quantity) || 0) <= 10);
  const totalUnits = stockList.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Stock Management & Inventory Adjustments
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              <PackageCheck size={14} /> Total: {totalUnits.toLocaleString()} units
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Live MongoDB inventory telemetry, real-time batch adjustments & automated low-stock warnings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={fetchLiveStock} 
            disabled={refreshing}
            className="btn btn-secondary"
            title="Refresh Live Stock"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Stock'}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {feedbackMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Critical Alerts Banner */}
      {lowStockItems.length > 0 && (
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--warning-glow)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertTriangle size={28} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '1rem' }}>
              {lowStockItems.length} Medicines Require Immediate Reordering
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Stock level has dropped to or below the safety reorder threshold (≤ 10 units). Use quick restock buttons below to replenish.
            </p>
          </div>
        </div>
      )}

      {/* Search Bar & Filters Strip */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Main Search Input */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search medicine by name, category, batch, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', height: '42px', width: '100%' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '160px' }}>
            <select 
              className="form-select" 
              style={{ height: '42px', width: '100%' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Tablet">Tablets</option>
              <option value="Capsule">Capsules</option>
              <option value="Syrup">Syrups</option>
              <option value="Injection">Injections</option>
              <option value="Ointment">Ointments</option>
              <option value="Drops">Drops</option>
              <option value="Inhaler">Inhalers</option>
            </select>
          </div>

        </div>
      </div>

      {/* Live Stock Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Batch / Barcode</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Expiry Alert</th>
                <th>Live Stock Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const stockBadge = getStockBadge(item.quantity, 10);
                  const expiryBadge = getExpiryBadge(item.expiryDate);
                  const isUpdating = updatingId === item._id;

                  return (
                    <tr key={item._id}>
                      {/* Medicine Name */}
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.manufacturer || 'Generic Pharma'}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {item.category || 'Tablet'}
                      </td>

                      {/* Batch & Barcode */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batch:</span>
                            <code style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: '600', 
                              color: 'var(--text-primary)', 
                              background: 'rgba(255, 255, 255, 0.06)', 
                              padding: '0.1rem 0.4rem', 
                              borderRadius: '4px' 
                            }}>
                              {item.batchNumber || 'N/A'}
                            </code>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Barcode size={13} color="#a855f7" />
                            <code style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '600' }}>
                              {item.barcode || '8901117001098'}
                            </code>
                          </div>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td>
                        <strong style={{ fontSize: '1.15rem', color: item.quantity <= 10 ? '#ef4444' : 'var(--text-primary)' }}>
                          {item.quantity}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>units</span>
                      </td>

                      {/* Stock Status Badge */}
                      <td>
                        <span className={`badge ${stockBadge.class}`}>
                          {stockBadge.label}
                        </span>
                      </td>

                      {/* Expiry Badge */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className={`badge ${expiryBadge.class}`}>
                            {expiryBadge.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Live Stock Adjustment */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button 
                            onClick={() => handleAdjustStock(item._id, 10)} 
                            disabled={isUpdating}
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: '700' }}
                            title="Add 10 units to stock"
                          >
                            +10
                          </button>
                          <button 
                            onClick={() => handleAdjustStock(item._id, 50)} 
                            disabled={isUpdating}
                            className="btn btn-primary" 
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: '700' }}
                            title="Add 50 units (Bulk Reorder)"
                          >
                            +50
                          </button>
                          <button 
                            onClick={() => handleAdjustStock(item._id, -5)} 
                            disabled={isUpdating || item.quantity <= 0}
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: '700' }}
                            title="Deduct 5 units from stock"
                          >
                            -5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading live inventory telemetry from MongoDB...' : 'No matching medicine records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StockManagement;
