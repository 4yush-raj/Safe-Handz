const express = require('express');
const router = express.Router();
const upload = require('../upload');
const { authenticateToken } = require('../auth');
const {
  uploadDocument,
  getCustomerDocuments,
  downloadDocument,
} = require('../documentcontroller');

// Upload a document (Key parameter: 'file')
router.post('/upload', authenticateToken, upload.single('file'), uploadDocument);

// Get list of documents for customer
router.get('/customer', authenticateToken, getCustomerDocuments);
router.get('/customer/:customerId', authenticateToken, getCustomerDocuments);

// Download document file
router.get('/:documentId/download', authenticateToken, downloadDocument);

module.exports = router;