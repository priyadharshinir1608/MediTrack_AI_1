const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const { addNotification, logActivity } = require('../services/firestoreService');

// Generate unique bill number
const generateBillNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MED-BILL-${timestamp}-${random}`;
};

// Process Checkout & Generate Bill
const createBill = async (req, res, next) => {
  try {
    const { 
      customerName = 'Walk-in Customer', 
      customerPhone = '', 
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

    // 3. Save Sale Record in MongoDB
    const sale = await Sale.create({
      billNumber,
      customerName,
      customerPhone,
      items: processedItems,
      totalAmount: subtotal,
      discount: discountAmount,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      paymentMethod,
      soldBy: req.user?.name || req.user?.email || 'Pharmacist'
    });

    // 4. Log Real-time Audit in Firestore
    await logActivity({
      action: 'medicine_sold',
      details: `Generated ${billNumber} for ${customerName} (Total: ₹${grandTotal.toFixed(2)}, Items: ${processedItems.length})`,
      userId: req.user?.firebaseUid || 'counter_staff'
    });

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully and inventory stock updated.',
      bill: sale
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
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
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
      $or: [{ billNumber }, { _id: billNumber.match(/^[0-9a-fA-F]{24}$/) ? billNumber : null }] 
    }).populate('items.medicine');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, bill });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBill,
  getBillingHistory,
  getBillByNumber
};
