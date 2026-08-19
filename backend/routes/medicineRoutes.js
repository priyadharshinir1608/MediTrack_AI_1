const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  uploadMedicineImage
} = require('../controllers/medicineController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', verifyToken, getMedicines);
router.get('/:id', verifyToken, getMedicineById);
router.post('/', verifyToken, addMedicine);
router.put('/:id', verifyToken, updateMedicine);
router.delete('/:id', verifyToken, deleteMedicine);
router.post('/upload', verifyToken, upload.single('image'), uploadMedicineImage);

module.exports = router;
