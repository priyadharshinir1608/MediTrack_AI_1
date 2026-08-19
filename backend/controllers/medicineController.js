const Medicine = require('../models/Medicine');
const { scanMedicineImage } = require('../services/ocrService');
const { addNotification, logActivity } = require('../services/firestoreService');

const getMedicines = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    const medicines = await Medicine.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: medicines.length, medicines });
  } catch (err) {
    next(err);
  }
};

const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.status(200).json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

const addMedicine = async (req, res, next) => {
  try {
    const medicineData = req.body;
    const medicine = await Medicine.create(medicineData);

    await logActivity({
      action: 'MEDICINE_ADDED',
      details: `Added ${medicine.name} (Batch ${medicine.batchNumber})`,
      userId: req.user?.firebaseUid
    });

    if (medicine.quantity <= 10) {
      await addNotification({
        title: 'Low Stock Alert',
        message: `${medicine.name} added with low stock (${medicine.quantity} units)`,
        type: 'warning',
        medicineId: medicine._id
      });
    }

    res.status(201).json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    await logActivity({
      action: 'MEDICINE_UPDATED',
      details: `Updated ${medicine.name}`,
      userId: req.user?.firebaseUid
    });

    res.status(200).json({ success: true, medicine });
  } catch (err) {
    next(err);
  }
};

const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    await logActivity({
      action: 'MEDICINE_DELETED',
      details: `Deleted ${medicine.name}`,
      userId: req.user?.firebaseUid
    });

    res.status(200).json({ success: true, message: 'Medicine deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const uploadMedicineImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const ocrResult = await scanMedicineImage(req.file.path);
    res.status(200).json(ocrResult);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  uploadMedicineImage
};
