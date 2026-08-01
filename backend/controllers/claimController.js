const prisma = require('../prismaClient');

// 1. Submit a Claim (Customer Only)
exports.submitClaim = async (req, res) => {
  try {
    const { policyId, claimAmount, reason } = req.body;

    if (!policyId || !claimAmount || !reason) {
      return res.status(400).json({ message: 'policyId, claimAmount, and reason are required.' });
    }

    // Verify policy exists
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { customer: true }
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found.' });
    }

    // Role Guard: Customers can only claim on their own active policies
    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer || policy.customerId !== customer.id) {
        return res.status(403).json({ message: 'Unauthorized to submit a claim for this policy.' });
      }
    }

    if (policy.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Claims can only be submitted for ACTIVE policies.' });
    }

    const claim = await prisma.claim.create({
      data: {
        policyId,
        claimAmount: parseFloat(claimAmount),
        reason,
        status: 'SUBMITTED'
      }
    });

    return res.status(201).json({
      message: 'Claim submitted successfully',
      claim
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. Get All Claims (Role Aware)
exports.getClaims = async (req, res) => {
  try {
    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });

      const claims = await prisma.claim.findMany({
        where: { policy: { customerId: customer.id } },
        include: { policy: true },
        orderBy: { submissionDate: 'desc' }
      });
      return res.status(200).json(claims);
    }

    // Admins and Agents view all claims across all users
    const claims = await prisma.claim.findMany({
      include: {
        policy: {
          include: { customer: true }
        }
      },
      orderBy: { submissionDate: 'desc' }
    });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. Update Claim Status - Verify / Approve / Reject (AGENT or ADMIN)
exports.updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body;

    const validStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` 
      });
    }

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      return res.status(404).json({ message: 'Claim record not found.' });
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { status }
    });

    return res.status(200).json({
      message: `Claim status updated to ${status}`,
      claim: updatedClaim
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
