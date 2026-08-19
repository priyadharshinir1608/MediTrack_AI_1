import React, { useState } from 'react';
import { Boxes, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { formatCurrency, getExpiryBadge, getStockBadge } from '../utils/helpers';

const StockManagement = () => {
  const [stockList, setStockList] = useState([
    { _id: '1', name: 'Amoxicillin 250mg', quantity: 8, threshold: 15, expiryDate: '2026-08-15', price: 120 },
    { _id: '2', name: 'Cough Syrup 100ml', quantity: 5, threshold: 10, expiryDate: '2026-08-30', price: 95 },
    { _id: '3', name: 'Paracetamol 500mg', quantity: 120, threshold: 20, expiryDate: '2026-12-31', price: 45 },
    { _id: '4', name: 'Vitamin C Chewable', quantity: 4, threshold: 10, expiryDate: '2026-07-10', price: 60 }
  ]);

  const handleAdjustStock = (id, amount) => {
    setStockList(prev => prev.map(item => {
      if (item._id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + amount) };
      }
      return item;
    }));
  };

  const lowStockItems = stockList.filter(i => i.quantity <= i.threshold);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Stock Management & AI Alerts</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Monitor inventory stock-out risks, low-stock thresholds, and quick stock replenishment
        </p>
      </div>

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
          <AlertTriangle size={28} color="var(--warning)" />
          <div>
            <h4 style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '1rem' }}>
              {lowStockItems.length} Medicines Require Immediate Reordering
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Stock level has dropped below safety thresholds. AI suggests reordering.
            </p>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Current Stock</th>
                <th>Min Threshold</th>
                <th>Status</th>
                <th>Expiry Alert</th>
                <th>Quick Restock</th>
              </tr>
            </thead>
            <tbody>
              {stockList.map(item => {
                const stockBadge = getStockBadge(item.quantity, item.threshold);
                const expiryBadge = getExpiryBadge(item.expiryDate);

                return (
                  <tr key={item._id}>
                    <td style={{ fontWeight: '600' }}>{item.name}</td>
                    <td><strong style={{ fontSize: '1.05rem' }}>{item.quantity}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.threshold} units</td>
                    <td><span className={`badge ${stockBadge.class}`}>{stockBadge.label}</span></td>
                    <td><span className={`badge ${expiryBadge.class}`}>{expiryBadge.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => handleAdjustStock(item._id, 10)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                          +10
                        </button>
                        <button onClick={() => handleAdjustStock(item._id, 50)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                          +50
                        </button>
                        <button onClick={() => handleAdjustStock(item._id, -5)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                          -5
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
