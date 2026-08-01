const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create Insurance Policy (ADMIN or AGENT only)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'AGENT'), async (req, res) => {
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
    return res.status(500).json({ error: error.message });
  }
});

// Get Active Policies for Logged-in Customer or All for Admin/Agent
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.status(404).json({ message: 'Customer profile not found' });

      const policies = await prisma.policy.findMany({ where: { customerId: customer.id } });
      return res.status(200).json(policies);
    }

    // Admin / Agent views all policies
    const policies = await prisma.policy.findMany({
      include: { customer: true }
    });
    return res.status(200).json(policies);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;