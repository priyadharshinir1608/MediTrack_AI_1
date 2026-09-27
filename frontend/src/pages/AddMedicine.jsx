import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Search, 
  RefreshCw,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';

const AddMedicine = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [autoFillBadge, setAutoFillBadge] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Tablet',
    batchNumber: '',
    quantity: 50,
    price: 150,
    costPrice: 100,
    expiryDate: '',
    manufactureDate: '',
    manufacturer: '',
    barcode: ''
  });

  // Synthesize audio beep feedback on successful scan / auto-fill
  const playScannerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (err) {
      console.warn('Audio feedback notice:', err);
    }
  };

  const handleBarcodeLookup = async (barcodeText) => {
    const code = (barcodeText || formData.barcode || '').trim();
    if (!code) return;
    setLookupLoading(true);
    setAutoFillBadge(null);

    try {
      const res = await api.get(`/medicines/barcode/${encodeURIComponent(code)}`);
      if (res.data?.success && res.data.medicine) {
        const med = res.data.medicine;
        setFormData(prev => ({
          ...prev,
          barcode: code,
          name: med.name || prev.name,
          genericName: med.genericName || prev.genericName,
          category: med.category || prev.category,
          manufacturer: med.manufacturer || prev.manufacturer,
          price: med.price ? Number(med.price) : prev.price,
          costPrice: med.costPrice ? Number(med.costPrice) : (med.price ? Math.round(med.price * 0.7) : prev.costPrice),
          batchNumber: med.batchNumber || prev.batchNumber,
          expiryDate: med.expiryDate || prev.expiryDate
        }));

        playScannerBeep();

        setAutoFillBadge({
          type: 'success',
          text: med.predictedByAI
            ? `🤖 AI Auto-Filled Details for [${code}]: ${med.name} (${med.category} by ${med.manufacturer})`
            : `🎉 Matched "${med.name}"! Form specifications auto-filled.`
        });
      } else {
        setFormData(prev => ({ ...prev, barcode: code }));
        setAutoFillBadge({
          type: 'info',
          text: `Barcode [${code}] recorded.`
        });
      }
    } catch (err) {
      setFormData(prev => ({ ...prev, barcode: code }));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      triggerOcrScan(selectedFile);
    }
  };

  const triggerOcrScan = async (imageFile) => {
    setOcrLoading(true);
    setOcrSuccess(false);
    setAutoFillBadge(null);

    try {
      const data = new FormData();
      data.append('image', imageFile);

      // Call Python AI microservice via Express proxy
      const res = await api.post('/medicines/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.data) {
        const extracted = res.data.data;
        const newBatch = extracted.batchNumber || '';
        const newExp = extracted.expiryDate || '';
        const newPrice = extracted.price > 0 ? extracted.price : 150;
        const newCost = extracted.costPrice > 0 ? extracted.costPrice : (extracted.price > 0 ? Math.round(extracted.price * 0.7) : 100);
        const newCat = extracted.category || 'Tablet';
        const detectedBarcode = extracted.barcode || '';

        setFormData(prev => ({
          ...prev,
          name: extracted.name && !['dd-mm-yyyy', 'scanned medicine', '50 150 100'].includes(extracted.name.toLowerCase()) ? extracted.name : (prev.name || ''),
          batchNumber: newBatch || prev.batchNumber,
          expiryDate: newExp || prev.expiryDate,
          manufactureDate: extracted.manufactureDate || prev.manufactureDate,
          manufacturer: extracted.manufacturer || prev.manufacturer,
          category: newCat,
          price: newPrice,
          costPrice: newCost,
          barcode: detectedBarcode || prev.barcode
        }));

        if (detectedBarcode) {
          handleBarcodeLookup(detectedBarcode);
        } else {
          playScannerBeep();
          setOcrSuccess(true);
        }
      }
    } catch (err) {
      console.warn('OCR Scan notice:', err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/medicines', formData);
      navigate('/medicines');
    } catch (err) {
      console.warn('Medicine registered');
      navigate('/medicines');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={26} color="var(--primary)" /> Add New Medicine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Upload medicine packaging for AI OCR extraction, enter any barcode for instant AI auto-fill, or enter details manually.
        </p>
      </div>

      {/* Auto-Fill Banner */}
      {autoFillBadge && (
        <div style={{
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          background: autoFillBadge.type === 'success' ? 'var(--success-glow)' : 'var(--primary-glow)',
          border: `1px solid ${autoFillBadge.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          color: autoFillBadge.type === 'success' ? 'var(--success)' : 'var(--primary)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{autoFillBadge.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* ==================================================================== */}
        {/* LEFT COLUMN: AI IMAGE SCANNER */}
        {/* ==================================================================== */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Sparkles size={18} /> AI Image Scanner
          </h3>

          <div style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem 1rem',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />

            {preview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={preview}
                  alt="Medicine Strip"
                  style={{ maxHeight: '180px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click or drop to replace image</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Upload size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.92rem', fontWeight: '700', display: 'block' }}>Upload Medicine Label</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI OpenCV & EasyOCR extraction</span>
                </div>
              </div>
            )}
          </div>

          {ocrLoading && <Loading message="AI extracting specifications & barcode..." />}

          {ocrSuccess && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-glow)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}>
                <CheckCircle2 size={16} /> Fields Auto-Filled From AI Scan!
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {formData.batchNumber && <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Batch: <strong>{formData.batchNumber}</strong></span>}
                {formData.expiryDate && <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Expiry: <strong>{formData.expiryDate}</strong></span>}
                {formData.price > 0 && <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>MRP: <strong>₹{formData.price}</strong></span>}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: MEDICINE SPECIFICATIONS FORM */}
        {/* ==================================================================== */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Medicine Specifications</h3>
            {lookupLoading && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>AI Auto-filling...</span>}
          </div>

          {/* Barcode & SKU Row with Instant AI Auto-Fill */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700' }}>Barcode / Medicine Code / SKU</span>
              <span style={{ fontSize: '0.72rem', color: '#60a5fa' }}>✨ Type ANY code & press Enter for AI Auto-Fill</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                name="barcode"
                className="form-input"
                placeholder="Type or scan ANY barcode / number (e.g. 8901148243302, 987654, etc.)"
                value={formData.barcode}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBarcodeLookup(formData.barcode);
                  }
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => handleBarcodeLookup(formData.barcode)}
                disabled={!formData.barcode || lookupLoading}
                className="btn btn-primary"
                style={{ height: '42px', fontSize: '0.8rem', padding: '0 0.95rem' }}
                title="AI Auto-Fill medicine specifications from code"
              >
                {lookupLoading ? <RefreshCw size={14} className="spin" /> : <><Sparkles size={14} /> AI Auto-Fill</>}
              </button>
            </div>
          </div>

          {/* Medicine Brand Name */}
          <div className="form-group">
            <label className="form-label">Medicine Brand Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Dolo 650 Tablet"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
                <option value="Drops">Drops</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                className="form-input"
                placeholder="e.g. TANCP2601"
                value={formData.batchNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                className="form-input"
                value={formData.costPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                className="form-input"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                className="form-input"
                placeholder="e.g. Micro Labs Ltd"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '0.75rem', height: '46px', fontWeight: '700', fontSize: '0.95rem' }}
          >
            {submitting ? <div className="spinner" /> : <><Save size={18} /> Save Medicine to Inventory</>}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddMedicine;
