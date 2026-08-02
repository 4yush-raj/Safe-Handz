const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../auth');
const { getProfile, updateProfile, getAllCustomers, getAllAgents } = require('../controllers/profileController');

router.get('/', authenticateToken, authorizeRoles('CUSTOMER', 'AGENT'), getProfile);
router.put('/', authenticateToken, authorizeRoles('CUSTOMER', 'AGENT'), updateProfile);
router.get('/all', authenticateToken, authorizeRoles('ADMIN', 'AGENT'), getAllCustomers);
router.get('/agents', authenticateToken, authorizeRoles('ADMIN'), getAllAgents);

module.exports = router;

