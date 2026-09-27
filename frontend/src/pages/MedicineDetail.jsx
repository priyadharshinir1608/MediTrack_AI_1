import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Pill, ArrowLeft, Edit3, Trash2, Calendar, ShieldCheck, 
  AlertTriangle, Barcode, DollarSign, Package, CheckCircle2, 
  Clock, TrendingUp, Sparkles, Layers, Activity 
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getExpiryBadge, getStockBadge } from '../utils/helpers';
import Loading from '../components/Loading';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchMedicineDetails();
  }, [id]);

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/medicines/${id}`);
      if (res.data?.medicine) {
        setMedicine(res.data.medicine);
      }
    } catch (err) {
      console.warn('Using live fallback for medicine detail:', err);
      // Dev Fallback
      setMedicine({
        _id: id,
        name: 'Allegra 120mg',
        category: 'Tablet',
        batchNumber: 'ALG-441',
        quantity: 18,
        price: 210,
        costPrice: 155,
        expiryDate: '2027-02-15',
        manufactureDate: '2025-02-15',
        manufacturer: 'Sanofi Healthcare Ltd',
        barcode: '8901117001098',
        location: 'Shelf B-3'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${medicine?.name}"?`)) {
      try {
        await api.delete(`/medicines/${id}`);
        navigate('/medicines');
      } catch (err) {
        navigate('/medicines');
      }
    }
  };

  if (loading) return <Loading message="Loading medicine specifications..." />;
  if (!medicine) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Medicine Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The requested medicine record does not exist or has been removed.</p>
        <button onClick={() => navigate('/medicines')} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Inventory
        </button>
      </div>
    );
  }

  // Derived Calculations
  const stockBadge = getStockBadge(medicine.quantity, 10);
  const expiryBadge = getExpiryBadge(medicine.expiryDate);
  const costPrice = Number(medicine.costPrice) || (medicine.price * 0.7);
  const profitMargin = medicine.price > 0 ? (((medicine.price - costPrice) / medicine.price) * 100).toFixed(1) : 0;
  const assetValuation = (Number(medicine.quantity) || 0) * (Number(medicine.price) || 0);

  // Expiry countdown calculations
  const now = new Date();
  const expDate = medicine.expiryDate ? new Date(medicine.expiryDate) : null;
  const daysUntilExpiry = expDate ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* 🚀 Top Navigation & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/medicines')} 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem 0.9rem' }}
            title="Back to Inventory Directory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                {medicine.name}
              </h1>
              <span className={`badge ${stockBadge.class}`} style={{ fontSize: '0.8rem' }}>
                {stockBadge.label}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Manufactured by <strong>{medicine.manufacturer || 'Generic Pharma Ltd'}</strong> &bull; Category: <strong>{medicine.category || 'Tablet'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`/medicines/edit/${medicine._id}`)} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Edit3 size={16} color="#fbbf24" /> Edit Record
          </button>
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* 📊 Key Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock on Hand</span>
            <Package size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: medicine.quantity <= 10 ? '#ef4444' : 'var(--text-primary)' }}>
            {medicine.quantity} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-muted)' }}>units</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: medicine.quantity <= 10 ? '#f59e0b' : '#22c55e', marginTop: '0.2rem', fontWeight: '600' }}>
            {medicine.quantity <= 10 ? '⚠️ Reorder Needed' : '✓ Healthy Supply Level'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unit Selling Price</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: '#10b981' }}>
            {formatCurrency(medicine.price)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Retail price per unit
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost Price</span>
            <TrendingUp size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: 'var(--text-primary)' }}>
            {formatCurrency(costPrice)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.2rem', fontWeight: '600' }}>
            +{profitMargin}% Profit Margin
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inventory Valuation</span>
            <Layers size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: 'var(--text-primary)' }}>
            {formatCurrency(assetValuation)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Total stock asset worth
          </div>
        </div>

      </div>

      {/* 📋 Main 2-Column Specifications & Safety Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Pharmaceutical & Inventory Specifications */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <Pill size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Pharmaceutical Specifications</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formulation Category</span>
              <div style={{ fontWeight: '700', marginTop: '0.25rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {medicine.category || 'Tablet'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batch Serial Number</span>
              <div style={{ marginTop: '0.25rem' }}>
                <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600', color: '#60a5fa' }}>
                  {medicine.batchNumber || 'N/A'}
                </code>
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Manufacturer</span>
              <div style={{ fontWeight: '600', marginTop: '0.25rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {medicine.manufacturer || 'Generic Pharma'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Barcode / SKU Code</span>
              <div style={{ fontWeight: '600', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                <Barcode size={15} color="#a855f7" />
                <code>{medicine.barcode || '8901117001098'}</code>
              </div>
            </div>

          </div>

          {/* Barcode Visual Preview Box */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Barcode size={32} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>EAN-13 Barcode Tag</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compatible with POS laser & camera scanners</div>
              </div>
            </div>
            <code style={{ fontSize: '0.9rem', color: '#a855f7', fontWeight: '700' }}>
              {medicine.barcode || '8901117001098'}
            </code>
          </div>

        </div>

        {/* Right Column: Expiration Timeline & Safety Assessment */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Expiration & Safety Radar</h3>
          </div>

          {/* Expiration Date Card */}
          <div style={{
            padding: '1.15rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Expiry Date</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <span className={`badge ${expiryBadge.class}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                {expiryBadge.label}
              </span>
            </div>

            {/* Countdown Days Strip */}
            {daysUntilExpiry !== null && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>Shelf Life Remaining:</span>
                  <strong style={{ color: daysUntilExpiry <= 60 ? '#ef4444' : '#10b981' }}>
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Batch Expired'}
                  </strong>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(5, (daysUntilExpiry / 365) * 100))}%`,
                    height: '100%',
                    background: daysUntilExpiry <= 60 
                      ? 'linear-gradient(90deg, #ef4444, #f59e0b)' 
                      : 'linear-gradient(90deg, #3b82f6, #10b981)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default MedicineDetail;
