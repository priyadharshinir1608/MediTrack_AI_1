import React from 'react';
import { Pill, AlertTriangle, Calendar, Tag } from 'lucide-react';
import { formatCurrency, getExpiryBadge, getStockBadge } from '../utils/helpers';

const MedicineCard = ({ medicine, onEdit, onDelete }) => {
  const expiryBadge = getExpiryBadge(medicine.expiryDate);
  const stockBadge = getStockBadge(medicine.quantity);

  return (
    <div className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Pill size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>{medicine.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{medicine.category || 'Medicine'}</span>
          </div>
        </div>
        <span className={`badge ${stockBadge.class}`}>{stockBadge.label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Batch</span>
          <strong>{medicine.batchNumber || 'N/A'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Price</span>
          <strong style={{ color: 'var(--success)' }}>{formatCurrency(medicine.price)}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Expiry</span>
          <span className={`badge ${expiryBadge.class}`} style={{ fontSize: '0.7rem' }}>{expiryBadge.label}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Manufacturer</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{medicine.manufacturer || 'N/A'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {onEdit && (
          <button onClick={() => onEdit(medicine)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(medicine._id)} className="btn btn-danger" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
