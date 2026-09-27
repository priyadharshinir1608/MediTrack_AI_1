import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Search, Barcode, Plus, Minus, Trash2, Printer, 
  CheckCircle2, CreditCard, DollarSign, Smartphone, ArrowRight, 
  Receipt, Clock, User, Phone, Sparkles, RefreshCw, AlertTriangle, 
  Layers, ChevronRight, X 
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getExpiryBadge, getStockBadge } from '../utils/helpers';

const Billing = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [loadingMeds, setLoadingMeds] = useState(true);

  // Billing Cart State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5); // Default 5% GST
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generated Invoice Modal State
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Recent Sales History Tab
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch medicines for catalog search
  const fetchMedicines = async () => {
    try {
      setLoadingMeds(true);
      const res = await api.get('/medicines');
      if (res.data?.medicines) {
        setMedicines(res.data.medicines);
      }
    } catch (err) {
      console.warn('Fallback medicines active for POS');
    } finally {
      setLoadingMeds(false);
    }
  };

  // Fetch sales history
  const fetchSalesHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/billing/history');
      if (res.data?.sales) {
        setSalesHistory(res.data.sales);
      }
    } catch (err) {
      console.warn('Could not load sales history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSalesHistory();
    }
  }, [activeTab]);

  // Filter medicines by search query
  const filteredCatalog = medicines.filter(m => {
    const term = searchTerm.toLowerCase();
    return (m.name || '').toLowerCase().includes(term) ||
      (m.category || '').toLowerCase().includes(term) ||
      (m.batchNumber || '').toLowerCase().includes(term);
  });

  // Handle Barcode Scan / Quick Enter
  const handleBarcodeLookup = (e) => {
    if (e.key === 'Enter' && barcodeQuery.trim()) {
      e.preventDefault();
      const match = medicines.find(m => 
        (m.barcode && m.barcode.toLowerCase() === barcodeQuery.trim().toLowerCase()) ||
        (m.batchNumber && m.batchNumber.toLowerCase() === barcodeQuery.trim().toLowerCase()) ||
        (m.name && m.name.toLowerCase().includes(barcodeQuery.trim().toLowerCase()))
      );

      if (match) {
        addToCart(match);
        setBarcodeQuery('');
        setErrorMsg('');
      } else {
        setErrorMsg(`No medicine found matching barcode/batch: "${barcodeQuery}"`);
      }
    }
  };

  // Add Item to Cart
  const addToCart = (med) => {
    setErrorMsg('');
    if (med.quantity <= 0) {
      setErrorMsg(`"${med.name}" is currently Out of Stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.medicineId === med._id);
      if (existing) {
        if (existing.quantity + 1 > med.quantity) {
          setErrorMsg(`Cannot add more. Max available stock for ${med.name} is ${med.quantity}.`);
          return prev;
        }
        return prev.map(item =>
          item.medicineId === med._id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            medicineId: med._id,
            medicineName: med.name,
            batchNumber: med.batchNumber || 'N/A',
            category: med.category || 'Tablet',
            maxStock: med.quantity,
            unitPrice: Number(med.price) || 0,
            quantity: 1,
            totalPrice: Number(med.price) || 0
          }
        ];
      }
    });
  };

  // Update Cart Quantity
  const updateQuantity = (medicineId, delta) => {
    setErrorMsg('');
    setCart(prev =>
      prev.map(item => {
        if (item.medicineId === medicineId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxStock) {
            setErrorMsg(`Max available stock for ${item.medicineName} is ${item.maxStock}.`);
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice
          };
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Remove Item
  const removeFromCart = (medicineId) => {
    setCart(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountAmount = (subtotal * Number(discountPercent)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * Number(taxPercent)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Checkout and Generate Bill
  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      setErrorMsg('Please add at least one medicine to the billing cart.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMsg('');

      const payload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || '',
        paymentMethod,
        discount: discountAmount,
        taxRate: Number(taxPercent),
        items: cart.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };

      const res = await api.post('/billing', payload);

      if (res.data?.bill) {
        setActiveInvoice(res.data.bill);
        setShowInvoiceModal(true);

        // Reset cart
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscountPercent(0);

        // Refresh medicines stock count
        fetchMedicines();
      }
    } catch (err) {
      console.error('Billing error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to process bill.');
    } finally {
      setProcessing(false);
    }
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 🚀 Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Medicine Billing & POS Checkout
            </h1>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              padding: '0.2rem 0.65rem', 
              borderRadius: '9999px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#60a5fa', 
              fontSize: '0.75rem', 
              fontWeight: '600' 
            }}>
              <ShoppingCart size={14} /> POS Counter
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Instant medicine sales, barcode scanning, auto-stock deduction & printable receipts
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('pos')}
            className={`btn ${activeTab === 'pos' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShoppingCart size={16} /> New Sale Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Receipt size={16} /> Invoices & History
          </button>
        </div>
      </div>

      {/* POS WORKSPACE */}
      {activeTab === 'pos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
          
          {/* LEFT: Medicine Selection & Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Search & Barcode Scanner Inputs */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                
                {/* Search by Name */}
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search medicine by brand or formula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.4rem', height: '42px' }}
                  />
                </div>

                {/* Fast Barcode Input */}
                <div style={{ width: '220px', position: 'relative' }}>
                  <Barcode size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#60a5fa' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Scan Barcode + Enter"
                    value={barcodeQuery}
                    onChange={(e) => setBarcodeQuery(e.target.value)}
                    onKeyDown={handleBarcodeLookup}
                    style={{ paddingLeft: '2.4rem', height: '42px', border: '1px solid rgba(59, 130, 246, 0.4)' }}
                  />
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-glow)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Catalog Medicine Quick Grid */}
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Available Medicines ({filteredCatalog.length})</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click card to add to billing cart</span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '0.85rem', 
                maxHeight: '480px', 
                overflowY: 'auto',
                paddingRight: '0.25rem' 
              }}>
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map(med => {
                    const badge = getStockBadge(med.quantity);
                    const isOutOfStock = med.quantity <= 0;
                    return (
                      <div
                        key={med._id}
                        onClick={() => !isOutOfStock && addToCart(med)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          opacity: isOutOfStock ? 0.5 : 1,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => { if (!isOutOfStock) e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                            {med.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {med.category || 'Tablet'} • Batch: {med.batchNumber || 'N/A'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                          <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.95rem' }}>
                            {formatCurrency(med.price)}
                          </span>
                          <span className={`badge ${badge.class}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                            {med.quantity} in stock
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No medicines match your search filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Active Billing Cart & Checkout Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', gap: '1.25rem' }}>
            
            {/* Cart Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Current Invoice</h3>
              </div>
              <span className="badge badge-primary">{cart.length} Items</span>
            </div>

            {/* Customer Details Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.65rem', 
              maxHeight: '260px', 
              overflowY: 'auto',
              borderTop: '1px solid var(--glass-border)',
              borderBottom: '1px solid var(--glass-border)',
              padding: '0.75rem 0'
            }}>
              {cart.length > 0 ? (
                cart.map(item => (
                  <div 
                    key={item.medicineId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.medicineName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ₹{item.unitPrice} each
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.75rem' }}>
                      <button 
                        onClick={() => updateQuantity(item.medicineId, -1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Minus size={12} />
                      </button>

                      <span style={{ fontWeight: '700', fontSize: '0.85rem', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>

                      <button 
                        onClick={() => updateQuantity(item.medicineId, 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line Total & Remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#10b981' }}>
                        ₹{item.totalPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.medicineId)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Billing cart is empty. Select medicines from the left catalog.
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Payment Method</label>
              <div style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: '600',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                💵 Cash Payment
              </div>
            </div>

            {/* Bill Summary Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Discount ({discountPercent}%):</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>GST / Tax ({taxPercent}%):</span>
                <span>+ ₹{taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: '800', 
                fontSize: '1.15rem', 
                color: '#22c55e', 
                borderTop: '1px solid var(--glass-border)', 
                paddingTop: '0.5rem',
                marginTop: '0.2rem'
              }}>
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleGenerateBill}
              disabled={cart.length === 0 || processing}
              className="btn btn-primary"
              style={{ width: '100%', height: '46px', fontSize: '0.95rem' }}
            >
              {processing ? <div className="spinner" /> : <>Generate & Print Bill <ArrowRight size={18} /></>}
            </button>

          </div>
        </div>
      )}

      {/* 📜 TAB 2: INVOICES & SALES HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Invoice Transactions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audit history of all generated pharmacy bills</p>
            </div>
            <button onClick={fetchSalesHistory} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Customer</th>
                  <th>Items Sold</th>
                  <th>Payment</th>
                  <th>Grand Total</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.length > 0 ? (
                  salesHistory.map(sale => (
                    <tr key={sale._id || sale.billNumber}>
                      <td style={{ fontWeight: '700', color: '#60a5fa' }}>{sale.billNumber}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{sale.customerName}</div>
                        {sale.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sale.customerPhone}</div>}
                      </td>
                      <td>{sale.items?.length || 1} items</td>
                      <td><span className="badge badge-secondary">{sale.paymentMethod || 'Cash'}</span></td>
                      <td style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(sale.grandTotal || sale.totalPrice || 0)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(sale.createdAt || sale.date).toLocaleString()}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setActiveInvoice(sale);
                            setShowInvoiceModal(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Printer size={12} /> View Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No billing records found. Complete a sale in the POS tab to generate invoices.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🧾 PRINTABLE INVOICE MODAL */}
      {showInvoiceModal && activeInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card fade-in" style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--glass-border)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--primary)" /> MedScan AI Pharmacy
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Smart Pharmacy & AI Medicine Management System
                </span>
              </div>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Payment Successful Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(16, 185, 129, 0.16))',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#22c55e',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={20} color="#22c55e" />
              <div style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                Payment Successful, Thank You 🤝
              </div>
            </div>

            {/* Invoice Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Bill Number:</div>
                <div style={{ fontWeight: '700', color: '#60a5fa' }}>{activeInvoice.billNumber}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Date & Time:</div>
                <div>{new Date(activeInvoice.createdAt || activeInvoice.date).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Customer:</div>
                <div style={{ fontWeight: '600' }}>{activeInvoice.customerName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Payment Mode:</div>
                <div style={{ fontWeight: '600' }}>{activeInvoice.paymentMethod || 'Cash'}</div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Item</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeInvoice.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: '600' }}>{item.medicineName}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{item.unitPrice}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600' }}>₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>₹{(activeInvoice.totalAmount || activeInvoice.totalPrice || 0).toFixed(2)}</span>
              </div>
              {activeInvoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Discount:</span>
                  <span>- ₹{activeInvoice.discount.toFixed(2)}</span>
                </div>
              )}
              {activeInvoice.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Tax:</span>
                  <span>+ ₹{activeInvoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.2rem', color: '#22c55e', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                <span>Grand Total:</span>
                <span>₹{(activeInvoice.grandTotal || activeInvoice.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Friendly Greeting Footer */}
            <div style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              borderTop: '1px dashed var(--glass-border)',
              paddingTop: '0.6rem'
            }}>
              Thank you for choosing MedScan AI Pharmacy! Stay Healthy 🤝
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                onClick={handlePrint} 
                className="btn btn-primary" 
                style={{ flex: 1, height: '42px' }}
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button 
                onClick={() => setShowInvoiceModal(false)} 
                className="btn btn-secondary" 
                style={{ flex: 1, height: '42px' }}
              >
                Close & New Sale
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Billing;
