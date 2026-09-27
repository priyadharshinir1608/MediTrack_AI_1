const express = require('express');
const router = express.Router();
const { createBill, getBillingHistory, getBillByNumber } = require('../controllers/billingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Mount protected routes
router.use(verifyToken);

router.post('/', createBill);
router.get('/history', getBillingHistory);
router.get('/:billNumber', getBillByNumber);

module.exports = router;
