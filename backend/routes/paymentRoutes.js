const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const {
  recordPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

// Record a payment
router.post('/', authenticateToken, recordPayment);

// Get payment history (Optionally by policyId via query or route parameter)
router.get('/', authenticateToken, getPaymentHistory);
router.get('/:policyId', authenticateToken, getPaymentHistory);

module.exports = router;
