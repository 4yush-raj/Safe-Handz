const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
    submitClaim,
    getClaims,
    updateClaimStatus
} = require('../controllers/claimController');

// Submit a new claim
router.post('/', authenticateToken, submitClaim);

// Get claims (Customers see their own; Admins/Agents see all)
router.get('/', authenticateToken, getClaims);

// Update claim status (Admins and Agents only)
router.patch('/:claimId/status', authenticateToken, authorizeRoles('ADMIN', 'AGENT'), updateClaimStatus);

module.exports = router;