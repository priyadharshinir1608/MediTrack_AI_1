import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pill, Search, Filter, Plus, Edit3, Trash2, Eye, Download, 
  RefreshCw, AlertTriangle, Clock, Layers, ArrowUpDown, 
  CheckCircle2, X, Sparkles, MapPin, Barcode, Package, DollarSign 
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, getExpiryBadge, getStockBadge } from '../utils/helpers';
import Loading from '../components/Loading';

const MedicineList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Filters & Sorting
  const [search, setSearch] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchMedicines = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/medicines');
      if (res.data?.medicines) {
        setMedicines(res.data.medicines);
      }
    } catch (err) {
      console.warn('Using live inventory fallback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Delete Medicine Handler
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await api.delete(`/medicines/${id}`);
        setMedicines(prev => prev.filter(m => m._id !== id));
        setFeedback(`"${name}" removed from inventory.`);
        setTimeout(() => setFeedback(''), 3500);
      } catch (e) {
        setMedicines(prev => prev.filter(m => m._id !== id));
      }
    }
  };

  // Export Inventory to CSV
  const handleExportCSV = () => {
    if (medicines.length === 0) return;

    const headers = ['Medicine Name', 'Category', 'Batch Number', 'Barcode', 'Manufacturer', 'Stock Quantity', 'Unit Price (INR)', 'Cost Price (INR)', 'Expiry Date', 'Location'];
    const rows = medicines.map(m => [
      `"${m.name || ''}"`,
      `"${m.category || 'Tablet'}"`,
      `"${m.batchNumber || ''}"`,
      `"${m.barcode || ''}"`,
      `"${m.manufacturer || ''}"`,
      m.quantity || 0,
      m.price || 0,
      m.costPrice || 0,
      m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A',
      `"${m.location || 'Shelf A1'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meditrack_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const filteredAndSortedMedicines = useMemo(() => {
    const now = new Date();
    const next60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    let result = medicines.filter(m => {
      const term = search.toLowerCase();
      const matchesSearch = 
        (m.name || '').toLowerCase().includes(term) ||
        (m.batchNumber || '').toLowerCase().includes(term) ||
        (m.barcode || '').toLowerCase().includes(term) ||
        (m.manufacturer || '').toLowerCase().includes(term);

      const matchesCat = categoryFilter === 'ALL' || (m.category || 'Tablet') === categoryFilter;

      let matchesStock = true;
      if (stockStatusFilter === 'LOW') matchesStock = (m.quantity || 0) <= 10 && (m.quantity || 0) > 0;
      else if (stockStatusFilter === 'OUT') matchesStock = (m.quantity || 0) === 0;
      else if (stockStatusFilter === 'IN_STOCK') matchesStock = (m.quantity || 0) > 10;

      let matchesExpiry = true;
      if (expiryFilter === 'EXPIRING_SOON') matchesExpiry = m.expiryDate && new Date(m.expiryDate) <= next60Days && new Date(m.expiryDate) >= now;
      else if (expiryFilter === 'EXPIRED') matchesExpiry = m.expiryDate && new Date(m.expiryDate) < now;
      else if (expiryFilter === 'SAFE') matchesExpiry = m.expiryDate && new Date(m.expiryDate) > next60Days;

      return matchesSearch && matchesCat && matchesStock && matchesExpiry;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'NAME_DESC') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'QTY_ASC') return (a.quantity || 0) - (b.quantity || 0);
      if (sortBy === 'QTY_DESC') return (b.quantity || 0) - (a.quantity || 0);
      if (sortBy === 'PRICE_ASC') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'PRICE_DESC') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'EXPIRY_ASC') return new Date(a.expiryDate || '2099') - new Date(b.expiryDate || '2099');
      return 0;
    });

    return result;
  }, [medicines, search, categoryFilter, stockStatusFilter, expiryFilter, sortBy]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredAndSortedMedicines.length / rowsPerPage) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedMedicines.slice(start, start + rowsPerPage);
  }, [filteredAndSortedMedicines, currentPage, rowsPerPage]);

  // Summary Metrics
  const totalUnits = medicines.reduce((acc, m) => acc + (Number(m.quantity) || 0), 0);
  const totalValuation = medicines.reduce((acc, m) => acc + ((Number(m.quantity) || 0) * (Number(m.price) || 0)), 0);
  const lowStockCount = medicines.filter(m => (m.quantity || 0) <= 10).length;
  const expiringCount = medicines.filter(m => m.expiryDate && new Date(m.expiryDate) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 🚀 Header & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Medicine Catalog & Inventory Directory
            </h1>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              {medicines.length} Cataloged SKUs
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage pharmaceutical batches, stock replenishment, unit pricing, barcodes & batch shelf locations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            title="Download Inventory as CSV"
          >
            <Download size={16} /> Export CSV
          </button>

          <button 
            onClick={() => navigate('/add-medicine')} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
          >
            <Plus size={18} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
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
          <span>{feedback}</span>
        </div>
      )}

      {/* 📊 Key Inventory Summary Stat Strip with Interactive Click Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Total SKUs */}
        <div 
          onClick={() => { setStockStatusFilter('ALL'); setExpiryFilter('ALL'); setSearch(''); }}
          className="glass-card" 
          style={{ padding: '0.9rem 1.15rem', cursor: 'pointer', transition: '0.2s' }}
          title="Click to reset filters and view all items"
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Cataloged Items</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {medicines.length} SKUs
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Active inventory</div>
        </div>

        {/* Available Stock */}
        <div className="glass-card" style={{ padding: '0.9rem 1.15rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Stock Quantity</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#8b5cf6', marginTop: '0.2rem' }}>
            {totalUnits.toLocaleString()} units
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total items on shelf</div>
        </div>

        {/* ⚠️ Low Stock Risk (Clickable Filter) */}
        <div 
          onClick={() => {
            const nextVal = stockStatusFilter === 'LOW' ? 'ALL' : 'LOW';
            setStockStatusFilter(nextVal);
            setExpiryFilter('ALL');
            setCurrentPage(1);
            setTimeout(() => {
              const el = document.getElementById('medicine-inventory-table-card');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.classList.add('highlight-pulse');
                setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
              }
            }, 80);
          }}
          className="glass-card" 
          style={{ 
            padding: '0.9rem 1.15rem', 
            cursor: 'pointer',
            border: stockStatusFilter === 'LOW' ? '1px solid #f59e0b' : '1px solid var(--glass-border)',
            background: stockStatusFilter === 'LOW' ? 'rgba(245, 158, 11, 0.14)' : 'rgba(255, 255, 255, 0.03)',
            boxShadow: stockStatusFilter === 'LOW' ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'var(--shadow-md)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none'
          }}
          title="Click to filter low stock items (≤10 units)"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Stock Items (≤10)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f59e0b', marginTop: '0.2rem' }}>
                {lowStockCount} alerts
              </div>
            </div>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '0.7rem', color: stockStatusFilter === 'LOW' ? '#fbbf24' : '#f59e0b', marginTop: '0.3rem', fontWeight: '600' }}>
            {stockStatusFilter === 'LOW' ? '● Active Filter (Click to reset)' : '• Click to view low stock →'}
          </div>
        </div>

        {/* ⏳ Expiring Soon (Clickable Filter) */}
        <div 
          onClick={() => {
            const nextVal = expiryFilter === 'EXPIRING_SOON' ? 'ALL' : 'EXPIRING_SOON';
            setExpiryFilter(nextVal);
            setStockStatusFilter('ALL');
            setCurrentPage(1);
            setTimeout(() => {
              const el = document.getElementById('medicine-inventory-table-card');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.classList.add('highlight-pulse');
                setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
              }
            }, 80);
          }}
          className="glass-card" 
          style={{ 
            padding: '0.9rem 1.15rem', 
            cursor: 'pointer',
            border: expiryFilter === 'EXPIRING_SOON' ? '1px solid #ef4444' : '1px solid var(--glass-border)',
            background: expiryFilter === 'EXPIRING_SOON' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.03)',
            boxShadow: expiryFilter === 'EXPIRING_SOON' ? '0 0 20px rgba(239, 68, 68, 0.25)' : 'var(--shadow-md)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none'
          }}
          title="Click to filter expiring soon batches (<60 days)"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expiring Soon (&lt;60d)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ef4444', marginTop: '0.2rem' }}>
                {expiringCount} batches
              </div>
            </div>
            <Clock size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '0.7rem', color: expiryFilter === 'EXPIRING_SOON' ? '#f87171' : '#ef4444', marginTop: '0.3rem', fontWeight: '600' }}>
            {expiryFilter === 'EXPIRING_SOON' ? '● Active Filter (Click to reset)' : '• Click to view expiring →'}
          </div>
        </div>

        {/* Total Asset Valuation */}
        <div className="glass-card" style={{ padding: '0.9rem 1.15rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Asset Valuation</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#10b981', marginTop: '0.2rem' }}>
            {formatCurrency(totalValuation)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Combined inventory value</div>
        </div>

      </div>

      {/* 🔍 Search & Multi-Filter Control Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Main Search Input */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by brand name, generic formula, batch no, barcode, or manufacturer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '2.5rem', height: '42px' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              style={{ height: '42px' }}
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

        {/* Active Filters Tag & Clear Action (Shown when filters active) */}
        {(search || categoryFilter !== 'ALL' || stockStatusFilter !== 'ALL' || expiryFilter !== 'ALL') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {stockStatusFilter === 'LOW' && (
                <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertTriangle size={12} /> Low Stock (≤10 units)
                  <button onClick={() => setStockStatusFilter('ALL')} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: 0, fontWeight: '700' }}>×</button>
                </span>
              )}
              {expiryFilter === 'EXPIRING_SOON' && (
                <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> Expiring Soon (&lt;60d)
                  <button onClick={() => setExpiryFilter('ALL')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontWeight: '700' }}>×</button>
                </span>
              )}
            </div>

            <button 
              onClick={() => { setSearch(''); setCategoryFilter('ALL'); setStockStatusFilter('ALL'); setExpiryFilter('ALL'); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* 📋 Medicine Inventory Data Table */}
      {loading ? (
        <Loading message="Fetching live medicine records from MongoDB..." />
      ) : (
        <div 
          id="medicine-inventory-table-card" 
          className="glass-card" 
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            transition: 'box-shadow 0.4s ease, border-color 0.4s ease'
          }}
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Brand & Details</th>
                  <th>Category</th>
                  <th>Batch / Barcode</th>
                  <th>Stock Quantity</th>
                  <th>Unit Price</th>
                  <th>Expiry Alert</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMedicines.length > 0 ? (
                  paginatedMedicines.map(med => {
                    const stockBadge = getStockBadge(med.quantity, 10);
                    const expiryBadge = getExpiryBadge(med.expiryDate);

                    return (
                      <tr 
                        key={med._id}
                        style={{
                          transition: 'background 0.2s ease, transform 0.2s ease'
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-md)',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Pill size={18} />
                            </div>
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                {med.name}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {med.manufacturer || 'Generic Pharma'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            {med.category || 'Tablet'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {med.batchNumber || 'N/A'}
                            </code>
                            {med.barcode && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Barcode size={12} /> {med.barcode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '1rem', color: med.quantity <= 10 ? '#ef4444' : 'var(--text-primary)' }}>
                              {med.quantity}
                            </span>
                            <span className={`badge ${stockBadge.class}`}>{stockBadge.label}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.95rem' }}>
                          {formatCurrency(med.price)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span className={`badge ${expiryBadge.class}`}>{expiryBadge.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button 
                              onClick={() => navigate(`/medicines/${med._id}`)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)' }}
                              title="View Full Specifications Page"
                            >
                              <Eye size={15} color="#60a5fa" />
                            </button>
                            <button 
                              onClick={() => navigate(`/medicines/edit/${med._id}`)}
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)' }}
                              title="Edit Medicine Details"
                            >
                              <Edit3 size={15} color="#fbbf24" />
                            </button>
                            <button 
                              onClick={() => handleDelete(med._id, med.name)} 
                              className="btn btn-danger" 
                              style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)' }}
                              title="Delete Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                      No matching medicine records found. Try adjusting your search query or filter tags.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 📄 Pagination Footer */}
          {filteredAndSortedMedicines.length > 0 && (
            <div style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="form-select"
                  style={{ width: '70px', padding: '0.2rem 0.5rem', height: '32px' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedMedicines.length)} of {filteredAndSortedMedicines.length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                >
                  &larr; Previous
                </button>
                <span style={{ fontSize: '0.85rem', padding: '0 0.5rem', color: 'var(--text-primary)' }}>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MedicineList;
