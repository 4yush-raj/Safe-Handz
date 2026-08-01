const express = require('express');
const prisma = require('../prismaClient');
const { authenticateToken, authorizeRoles } = require('../auth');
const {
  downloadPolicyCertificate,
  requestPolicy,
  updatePolicyStatus
} = require('../controllers/policyController');
const {
  getFallbackCustomerByUserId,
  getFallbackPoliciesForCustomer,
  getAllFallbackPolicies,
} = require('../fallbackStorage');

const router = express.Router();

// Create Insurance Policy (ADMIN or AGENT only)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'AGENT'), async (req, res) => {
  if (!prisma?.dbAvailable) {
    return res.status(503).json({ message: 'Database unavailable. Unable to create policy at this time.' });
  }

  try {
    const { customerId, policyType, policyNumber, premiumAmount, startDate, endDate } = req.body;

    const policy = await prisma.policy.create({
      data: {
        customerId,
        policyType,
        policyNumber,
        premiumAmount: parseFloat(premiumAmount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'ACTIVE'
      }
    });

    return res.status(201).json({ message: 'Policy created successfully', policy });
  } catch (error) {
    prisma.dbAvailable = false;
    console.warn('Policy create DB failure, disabling DB until restart:', error.message);
    return res.status(500).json({ message: 'Policy creation failed due to database error.' });
  }
});

router.post('/request', authenticateToken, authorizeRoles('CUSTOMER'), requestPolicy);
router.patch('/:policyId/status', authenticateToken, authorizeRoles('ADMIN', 'AGENT'), updatePolicyStatus);

// Get Active Policies for Logged-in Customer or All for Admin/Agent
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (prisma?.dbAvailable) {
      try {
        if (req.user.role === 'CUSTOMER') {
          const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
          if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

          const policies = await prisma.policy.findMany({ where: { customerId: customer.id } });
          return res.status(200).json(policies);
        }

        const policies = await prisma.policy.findMany({
          include: { customer: true }
        });
        return res.status(200).json(policies);
      } catch (dbError) {
        prisma.dbAvailable = false;
        console.warn('Policy list DB query failed, switching fallback mode:', dbError.message);
      }
    }

    if (req.user.role === 'CUSTOMER') {
      const { customer } = getFallbackCustomerByUserId(req.user.id);
      if (!customer) return res.status(404).json({ message: 'Customer profile not found' });
      const policies = getFallbackPoliciesForCustomer(customer.id);
      return res.status(200).json(policies);
    }

    return res.status(200).json(getAllFallbackPolicies());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Download policy certificate PDF
router.get('/:policyId/download', authenticateToken, downloadPolicyCertificate);

module.exports = router;
