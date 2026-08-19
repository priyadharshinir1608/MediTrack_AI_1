const Medicine = require('../models/Medicine');

const getLowStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStockMedicines = await Medicine.find({ quantity: { $lte: threshold } }).sort({ quantity: 1 });
    res.status(200).json({ success: true, count: lowStockMedicines.length, medicines: lowStockMedicines });
  } catch (err) {
    next(err);
  }
};

const getExpiryAlerts = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 60;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const expiringMedicines = await Medicine.find({ expiryDate: { $lte: targetDate } }).sort({ expiryDate: 1 });
    res.status(200).json({ success: true, count: expiringMedicines.length, medicines: expiringMedicines });
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const medicine = await Medicine.findByIdAndUpdate(id, { quantity }, { new: true });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.status(200).json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLowStock,
  getExpiryAlerts,
  updateStock
};
