const express = require('express');
const router = express.Router();
const { 
  createBill, 
  getBillingHistory, 
  getBillByNumber,
  sendInvoiceEmail 
} = require('../controllers/billingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Mount protected routes
router.use(verifyToken);

router.post('/', createBill);
router.get('/history', getBillingHistory);
router.get('/:billNumber', getBillByNumber);
router.post('/:billNumber/email', sendInvoiceEmail);

module.exports = router;
