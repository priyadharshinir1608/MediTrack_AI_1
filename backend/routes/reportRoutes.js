const express = require('express');
const router = express.Router();
const { getSalesReport, getStockReport } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/sales', verifyToken, getSalesReport);
router.get('/stock', verifyToken, getStockReport);

module.exports = router;
