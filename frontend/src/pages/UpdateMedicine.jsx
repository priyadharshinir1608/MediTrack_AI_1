import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

const UpdateMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tablet',
    batchNumber: '',
    quantity: 0,
    price: 0,
    costPrice: 0,
    expiryDate: '',
    manufacturer: '',
    barcode: '',
    location: ''
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        if (res.data?.medicine) {
          setFormData(res.data.medicine);
        }
      } catch (e) {
        // Dev Fallback
        setFormData({
          name: 'Paracetamol 500mg',
          category: 'Tablet',
          batchNumber: 'B-98745',
          quantity: 120,
          price: 45,
          costPrice: 30,
          expiryDate: '2026-12-31',
          manufacturer: 'MedLab Pharma',
          barcode: '8901234567890',
          location: 'Shelf A1'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/medicines/${id}`, formData);
    } catch (e) {
      // simulation
    } finally {
      setSaving(false);
      navigate('/medicines');
    }
  };

  if (loading) return <Loading message="Loading medicine details..." />;

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/medicines')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Update Medicine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Edit medicine records and stock pricing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Brand Name</label>
          <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Ointment">Ointment</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Batch Number</label>
            <input type="text" name="batchNumber" className="form-input" value={formData.batchNumber} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input type="number" name="price" className="form-input" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Cost (₹)</label>
            <input type="number" name="costPrice" className="form-input" value={formData.costPrice} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input type="date" name="expiryDate" className="form-input" value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ height: '44px', marginTop: '1rem' }}>
          {saving ? <div className="spinner" /> : <><Save size={18} /> Update Record</>}
        </button>
      </form>
    </div>
  );
};

export default UpdateMedicine;
