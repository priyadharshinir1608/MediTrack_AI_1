const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const { addNotification, logActivity } = require('../services/firestoreService');
const { sendBillEmail } = require('../services/emailService');

// Generate unique bill / invoice number (e.g. INV-2026-00125)
const generateBillNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${year}-${timestamp}${random}`;
};

// Process Checkout & Generate Bill
const createBill = async (req, res, next) => {
  try {
    const { 
      customerName = 'Walk-in Customer', 
      customerPhone = '', 
      customerEmail = '',
      sendEmailReceipt = true,
      items = [], 
      paymentMethod = 'Cash',
      discount = 0,
      taxRate = 0 // e.g. 5% GST
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Billing cart cannot be empty.' });
    }

    const processedItems = [];
    let subtotal = 0;

    // 1. Validate Stock Availability & Deduct Inventory
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId || item.medicine);
      if (!medicine) {
        return res.status(404).json({ 
          success: false, 
          message: `Medicine not found: ${item.medicineName || item.medicineId}` 
        });
      }

      const requestedQty = Number(item.quantity);
      if (medicine.quantity < requestedQty) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}, Requested: ${requestedQty}` 
        });
      }

      // Deduct stock
      medicine.quantity -= requestedQty;
      await medicine.save();

      // Check if stock dropped below reorder threshold (10 units)
      if (medicine.quantity <= 10) {
        await addNotification({
          title: `Low Stock Alert: ${medicine.name}`,
          message: `Stock level for ${medicine.name} has dropped to ${medicine.quantity} units following a sale.`,
          type: 'warning',
          medicineId: medicine._id.toString()
        });
      }

      const itemTotal = requestedQty * medicine.price;
      subtotal += itemTotal;

      processedItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        batchNumber: medicine.batchNumber || '',
        quantity: requestedQty,
        unitPrice: medicine.price,
        totalPrice: itemTotal
      });
    }

    // 2. Compute Taxes, Discounts & Grand Total
    const discountAmount = Number(discount) || 0;
    const taxAmount = (subtotal - discountAmount) * (Number(taxRate) / 100);
    const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

    const billNumber = generateBillNumber();

    // 3. Save Sale Record in MongoDB with SUCCESS paymentStatus
    const sale = await Sale.create({
      billNumber,
      invoiceNumber: billNumber,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || '',
      customerEmail: customerEmail.trim().toLowerCase() || '',
      items: processedItems,
      totalAmount: subtotal,
      discount: discountAmount,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      paymentMethod,
      paymentStatus: 'SUCCESS',
      emailReceiptSent: false,
      soldBy: req.user?.name || req.user?.email || 'Pharmacist'
    });

    // 4. Send Gmail receipt only after successful billing
    let emailStatus = { sent: false, message: 'Receipt email skipped or not requested.' };

    if (sale.paymentStatus === 'SUCCESS' && sendEmailReceipt && sale.customerEmail && sale.customerEmail.includes('@')) {
      try {
        const mailRes = await sendBillEmail({ to: sale.customerEmail, sale });
        if (mailRes.success) {
          sale.emailReceiptSent = true;
          await sale.save();
          emailStatus = { sent: true, message: `Receipt successfully emailed to ${sale.customerEmail}` };
        } else {
          sale.emailReceiptError = mailRes.message || 'Delivery error';
          await sale.save();
          emailStatus = { sent: false, message: mailRes.message || 'Email delivery failed' };
        }
      } catch (mailErr) {
        console.warn('[Billing Controller] Email receipt error:', mailErr.message);
        emailStatus = { sent: false, message: mailErr.message };
      }
    }

    // 5. Log Real-time Audit in Firestore
    await logActivity({
      action: 'medicine_sold',
      details: `Generated ${billNumber} for ${sale.customerName} (Total: ₹${grandTotal.toFixed(2)}, Items: ${processedItems.length}${sale.emailReceiptSent ? ', Receipt Emailed' : ''})`,
      userId: req.user?.firebaseUid || 'counter_staff'
    });

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully and inventory stock updated.',
      bill: sale,
      emailStatus
    });
  } catch (err) {
    next(err);
  }
};

// Get Past Invoices / Sales History
const getBillingHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      sales
    });
  } catch (err) {
    next(err);
  }
};

// Get Single Invoice Details
const getBillByNumber = async (req, res, next) => {
  try {
    const { billNumber } = req.params;
    const bill = await Sale.findOne({ 
      $or: [
        { billNumber },
        { invoiceNumber: billNumber },
        { _id: billNumber.match(/^[0-9a-fA-F]{24}$/) ? billNumber : null }
      ] 
    }).populate('items.medicine');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, bill });
  } catch (err) {
    next(err);
  }
};

// Send or Resend Invoice via Email
const sendInvoiceEmail = async (req, res, next) => {
  try {
    const { billNumber } = req.params;
    const { email } = req.body;

    const sale = await Sale.findOne({
      $or: [
        { billNumber },
        { invoiceNumber: billNumber },
        { _id: billNumber.match(/^[0-9a-fA-F]{24}$/) ? billNumber : null }
      ]
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const recipient = (email || sale.customerEmail || '').trim().toLowerCase();
    if (!recipient || !recipient.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid customer email address is required.' });
    }

    const mailRes = await sendBillEmail({ to: recipient, sale });
    if (mailRes.success) {
      sale.customerEmail = recipient;
      sale.emailReceiptSent = true;
      sale.emailReceiptError = '';
      await sale.save();

      return res.status(200).json({
        success: true,
        message: `Billing receipt successfully emailed to ${recipient}`,
        sale
      });
    } else {
      return res.status(500).json({
        success: false,
        message: mailRes.message || 'Failed to send billing email receipt'
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBill,
  getBillingHistory,
  getBillByNumber,
  sendInvoiceEmail
};
