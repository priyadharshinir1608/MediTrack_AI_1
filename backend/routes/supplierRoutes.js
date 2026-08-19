const express = require('express');
const router = express.Router();
const { getSuppliers, addSupplier } = require('../controllers/supplierController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getSuppliers);
router.post('/', verifyToken, addSupplier);

module.exports = router;
