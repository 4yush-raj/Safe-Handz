const prisma = require('../prismaClient');

// 1. Record / Process Premium Payment
exports.recordPayment = async (req, res) => {
  try {
    const { policyId, amount } = req.body;

    if (!policyId || !amount) {
      return res.status(400).json({ message: 'policyId and amount are required.' });
    }

    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found.' });
    }

    // Role Guard: Customers can only record payments for their own policies
    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer || policy.customerId !== customer.id) {
        return res.status(403).json({ message: 'Unauthorized to record payment for this policy.' });
      }
    }

    const payment = await prisma.premiumPayment.create({
      data: {
        policyId,
        amount: parseFloat(amount),
        paymentStatus: 'COMPLETED',
        paymentDate: new Date()
      }
    });

    return res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. Get Payment History for a Policy or User
exports.getPaymentHistory = async (req, res) => {
  try {
    const { policyId } = req.params;

    if (policyId) {
      const policy = await prisma.policy.findUnique({ where: { id: policyId } });
      if (!policy) {
        return res.status(404).json({ message: 'Policy not found.' });
      }

      // Role Guard: Customers can only view payment history for their own policies
      if (req.user.role === 'CUSTOMER') {
        const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
        if (!customer || policy.customerId !== customer.id) {
          return res.status(403).json({ message: 'Unauthorized to view payment history for this policy.' });
        }
      }

      const payments = await prisma.premiumPayment.findMany({
        where: { policyId },
        orderBy: { paymentDate: 'desc' }
      });
      return res.status(200).json(payments);
    }

    // Role-based retrieval if no policyId provided
    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });

      const payments = await prisma.premiumPayment.findMany({
        where: { policy: { customerId: customer.id } },
        include: { policy: true },
        orderBy: { paymentDate: 'desc' }
      });
      return res.status(200).json(payments);
    }

    // Admins and Agents view all payments
    const payments = await prisma.premiumPayment.findMany({
      include: { policy: { include: { customer: true } } },
      orderBy: { paymentDate: 'desc' }
    });

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
