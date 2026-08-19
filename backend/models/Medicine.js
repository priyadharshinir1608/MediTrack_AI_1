const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    genericName: { type: String, default: '' },
    brand: { type: String, default: '' },
    category: { type: String, default: 'Tablet' },
    batchNumber: { type: String, required: true, trim: true, index: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true, index: true },
    manufactureDate: { type: Date },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    location: { type: String, default: 'Main Store' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    barcode: { type: String, default: '', index: true },
    ocrData: { type: Object, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
