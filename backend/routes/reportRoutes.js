const express = require('express');
const router = express.Router();
const { getSalesReport, getStockReport, getDayByDayAnalytics } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/sales', verifyToken, getSalesReport);
router.get('/stock', verifyToken, getStockReport);
router.get('/analytics/day-by-day', verifyToken, getDayByDayAnalytics);

module.exports = router;
