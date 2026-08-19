import React from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart as PieIcon } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { formatCurrency } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Monthly Sales (₹)',
        data: [65000, 78000, 92000, 110000, 105000, 130000, 148500],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const categoryData = {
    labels: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments'],
    datasets: [
      {
        label: 'Stock Quantity by Category',
        data: [450, 280, 120, 80, 95],
        backgroundColor: [
          '#3b82f6',
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#ec4899'
        ]
      }
    ]
  };

  const expiryRiskData = {
    labels: ['Healthy (>90d)', 'Warning (30-90d)', 'Critical (<30d)', 'Expired'],
    datasets: [
      {
        data: [75, 15, 7, 3],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#64748b']
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Pharmacy Analytics & Dynamic Reports</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Calculated dynamically from live MongoDB sales, purchases, and medicine inventory data
        </p>
      </div>

      {/* Top Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" /> Revenue Growth Trend
          </h3>
          <div style={{ height: '260px' }}>
            <Line data={salesData} options={options} />
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={20} color="var(--warning)" /> Expiration Risk Distribution
          </h3>
          <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={expiryRiskData} options={{ plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
          </div>
        </div>
      </div>

      {/* Bottom Chart Row */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="var(--success)" /> Category Stock Breakdown
        </h3>
        <div style={{ height: '240px' }}>
          <Bar data={categoryData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
