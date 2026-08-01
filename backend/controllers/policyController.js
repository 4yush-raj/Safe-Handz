const prisma = require('../prismaClient');
const { createFallbackPolicy, getFallbackCustomerByUserId } = require('../fallbackStorage');
const { generatePolicyPDF } = require('../pdfService');

const POLICY_TYPES = ['Health', 'Auto', 'Home', 'Travel', 'Business', 'Life'];

function generatePolicyNumber() {
  return `PH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function getPremiumForPolicyType(policyType) {
  const pricing = {
    Health: 250,
    Auto: 320,
    Home: 420,
    Travel: 120,
    Business: 650,
    Life: 300,
  };
  return pricing[policyType] ?? 199;
}

exports.requestPolicy = async (req, res) => {
  try {
    const { policyType, startDate, endDate } = req.body;

    if (!policyType || !startDate || !endDate) {
      return res.status(400).json({ message: 'policyType, startDate, and endDate are required.' });
    }

    if (!POLICY_TYPES.includes(policyType)) {
      return res.status(400).json({ message: `Unsupported policy type. Choose one of: ${POLICY_TYPES.join(', ')}` });
    }

    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ message: 'Only customers can request new policies.' });
    }

    let customer = null;
    let usedFallback = false;

    if (prisma?.dbAvailable) {
      try {
        customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      } catch (dbErr) {
        prisma.dbAvailable = false;
        console.warn('Customer lookup failed, falling back to file store:', dbErr.message);
      }
    }

    if (!customer) {
      const fallbackResult = getFallbackCustomerByUserId(req.user.id);
      customer = fallbackResult.customer;
      usedFallback = true;
    }

    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const policyPayload = {
      policyType,
      policyNumber: generatePolicyNumber(),
      premiumAmount: getPremiumForPolicyType(policyType),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'PENDING'
    };

    if (usedFallback || !prisma?.dbAvailable) {
      const policy = createFallbackPolicy(customer.id, policyPayload);
      return res.status(201).json({ message: 'Policy request submitted successfully (fallback storage).', policy });
    }

    try {
      const policy = await prisma.policy.create({
        data: {
          customerId: customer.id,
          ...policyPayload
        }
      });
      return res.status(201).json({ message: 'Policy request submitted successfully.', policy });
    } catch (dbErr) {
      prisma.dbAvailable = false;
      console.warn('Policy creation failed, falling back to file store:', dbErr.message);
      const policy = createFallbackPolicy(customer.id, policyPayload);
      return res.status(201).json({ message: 'Policy request submitted successfully (fallback storage).', policy });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updatePolicyStatus = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
    }

    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) {
      return res.status(404).json({ message: 'Policy record not found.' });
    }

    const updatedPolicy = await prisma.policy.update({
      where: { id: policyId },
      data: { status }
    });

    return res.status(200).json({ message: `Policy status updated to ${status}.`, policy: updatedPolicy });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to handle downloading a policy PDF certificate.
 */
exports.downloadPolicyCertificate = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { customer: true }
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy certificate not found.' });
    }

    if (policy.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Policy certificate is available only for active policies.' });
    }

    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer || policy.customerId !== customer.id) {
        return res.status(403).json({ message: 'Unauthorized to download this policy certificate.' });
      }
    }

    generatePolicyPDF(policy, res);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate policy PDF certificate.' });
    }
  }
};