import React, { useState, useEffect } from 'react';
import { Pill, Search, Filter, Plus, Edit3, Trash2 } from 'lucide-react';
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
  const [search, setSearch] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      if (res.data?.medicines) {
        setMedicines(res.data.medicines);
      }
    } catch (err) {
      console.warn('Using mock inventory list');
      setMedicines([
        { _id: '1', name: 'Paracetamol 500mg', category: 'Tablet', batchNumber: 'B-98745', quantity: 120, price: 45, expiryDate: '2026-12-31', manufacturer: 'MedLab Pharma' },
        { _id: '2', name: 'Amoxicillin 250mg', category: 'Capsule', batchNumber: 'B-44321', quantity: 8, price: 120, expiryDate: '2026-09-15', manufacturer: 'Apex Health' },
        { _id: '3', name: 'Azithromycin 500mg', category: 'Tablet', batchNumber: 'B-11223', quantity: 45, price: 180, expiryDate: '2027-03-20', manufacturer: 'Sun Remedies' },
        { _id: '4', name: 'Cough Syrup 100ml', category: 'Syrup', batchNumber: 'B-77889', quantity: 15, price: 95, expiryDate: '2026-08-30', manufacturer: 'BioLife' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine record?')) {
      try {
        await api.delete(`/medicines/${id}`);
      } catch (e) {
        // simulation
      }
      setMedicines(prev => prev.filter(m => m._id !== id));
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Medicine Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage pharmaceutical stock, pricing, and expiration dates
          </p>
        </div>
        <button onClick={() => navigate('/add-medicine')} className="btn btn-primary">
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search medicine name, batch number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Tablet">Tablets</option>
            <option value="Capsule">Capsules</option>
            <option value="Syrup">Syrups</option>
            <option value="Injection">Injections</option>
            <option value="Ointment">Ointments</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loading message="Fetching medicine records..." />
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Brand</th>
                  <th>Category</th>
                  <th>Batch No</th>
                  <th>Stock Qty</th>
                  <th>Price</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map(med => {
                    const stockBadge = getStockBadge(med.quantity);
                    const expiryBadge = getExpiryBadge(med.expiryDate);

                    return (
                      <tr key={med._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--primary-glow)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Pill size={16} />
                            </div>
                            <div>
                              <strong style={{ display: 'block' }}>{med.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.manufacturer || 'Generic'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{med.category || 'Tablet'}</td>
                        <td><code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{med.batchNumber || 'N/A'}</code></td>
                        <td><span className={`badge ${stockBadge.class}`}>{stockBadge.label}</span></td>
                        <td style={{ color: 'var(--success)', fontWeight: '600' }}>{formatCurrency(med.price)}</td>
                        <td><span className={`badge ${expiryBadge.class}`}>{expiryBadge.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => navigate(`/medicines/edit/${med._id}`)} className="btn btn-secondary" style={{ padding: '0.35rem' }}>
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDelete(med._id)} className="btn btn-danger" style={{ padding: '0.35rem' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No matching medicine records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineList;
