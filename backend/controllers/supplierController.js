const Supplier = require('../models/Supplier');

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, suppliers });
  } catch (err) {
    next(err);
  }
};

const addSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSuppliers,
  addSupplier
};
