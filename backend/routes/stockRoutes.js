const express = require('express');
const router = express.Router();
const { getLowStock, getExpiryAlerts, updateStock } = require('../controllers/stockController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/low-stock', verifyToken, getLowStock);
router.get('/expiry-alerts', verifyToken, getExpiryAlerts);
router.put('/update/:id', verifyToken, updateStock);
router.put('/:id', verifyToken, updateStock);

module.exports = router;
