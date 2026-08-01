const prisma = require('../prismaClient');
const buildDashboardPayload = (role) => {
  const normalizedRole = (role || 'ADMIN').toUpperCase();

  const roleConfig = {
    ADMIN: {
      title: 'Executive Operations Overview',
      metrics: [
        { label: 'Total Revenue', value: '$2.84M', change: '+12.5% this month', icon: 'CircleDollarSign', accent: 'from-emerald-500 to-teal-500' },
        { label: 'Active Policies', value: '18.2K', change: '+8.1% this month', icon: 'ShieldCheck', accent: 'from-indigo-500 to-violet-500' },
        { label: 'Claims Pending', value: '342', change: '-4.3% today', icon: 'AlertTriangle', accent: 'from-amber-500 to-orange-500' },
        { label: 'Customers Onboarded', value: '9,751', change: '+16.2% this month', icon: 'Users', accent: 'from-sky-500 to-cyan-500' },
      ],
      chartData: {
        monthly: [
          { month: 'Jan', premiums: 180, claims: 82 },
          { month: 'Feb', premiums: 205, claims: 93 },
          { month: 'Mar', premiums: 228, claims: 87 },
          { month: 'Apr', premiums: 252, claims: 104 },
          { month: 'May', premiums: 274, claims: 112 },
          { month: 'Jun', premiums: 298, claims: 121 },
        ],
        distribution: [
          { label: 'Health', value: 35, color: '#2563eb' },
          { label: 'Auto', value: 25, color: '#7c3aed' },
          { label: 'Life', value: 20, color: '#0f766e' },
          { label: 'Property', value: 20, color: '#f59e0b' },
        ],
      },
      activityRows: [
        { id: 'POL-2048', name: 'Maya Chen', category: 'Policy', date: '2026-07-26', amount: '$2,340', status: 'Active' },
        { id: 'CLM-1184', name: 'Liam Ortiz', category: 'Claim', date: '2026-07-24', amount: '$8,920', status: 'Pending' },
        { id: 'PAY-881', name: 'Sofia Patel', category: 'Payment', date: '2026-07-20', amount: '$540', status: 'Approved' },
        { id: 'CLM-1155', name: 'Noah Kim', category: 'Claim', date: '2026-07-15', amount: '$6,250', status: 'Rejected' },
        { id: 'POL-2031', name: 'Ava Brooks', category: 'Policy', date: '2026-07-12', amount: '$1,880', status: 'Overdue' },
      ],
      auditLogs: [
        { title: 'Fraud review completed', detail: 'Risk module verified 14 high-risk claims.', time: '12 mins ago' },
        { title: 'Policy template updated', detail: 'New bundled coverage options published to the portal.', time: '1 hr ago' },
        { title: 'Customer onboarding synced', detail: '1,240 new accounts imported successfully.', time: '3 hrs ago' },
      ],
      pendingClaims: [
        { title: 'Hospital discharge documents', customer: 'Jordan Lee', priority: 'High' },
        { title: 'Vehicle inspection report', customer: 'Marcus Hall', priority: 'Medium' },
        { title: 'Income verification', customer: 'Nina Flores', priority: 'High' },
      ],
      renewals: [
        { customer: 'Riley Scott', policy: 'Life Shield', days: '14 days' },
        { customer: 'Carmen Diaz', policy: 'Auto Plus', days: '22 days' },
        { customer: 'Stephen Cole', policy: 'Home Guard', days: '29 days' },
      ],
    },
    AGENT: {
      title: 'Claims & Renewal Command Center',
      metrics: [
        { label: 'Pending Verifications', value: '47', change: '7 urgent', icon: 'FileText', accent: 'from-amber-500 to-orange-500' },
        { label: 'Renewals Due (30d)', value: '126', change: '12 high-value', icon: 'Clock3', accent: 'from-sky-500 to-cyan-500' },
        { label: 'Policies Issued', value: '314', change: '+9.4% week', icon: 'BriefcaseBusiness', accent: 'from-emerald-500 to-teal-500' },
        { label: 'Customer Satisfaction', value: '94%', change: 'Excellent', icon: 'Sparkles', accent: 'from-violet-500 to-fuchsia-500' },
      ],
      chartData: {
        monthly: [
          { month: 'Jan', premiums: 140, claims: 72 },
          { month: 'Feb', premiums: 168, claims: 79 },
          { month: 'Mar', premiums: 192, claims: 85 },
          { month: 'Apr', premiums: 214, claims: 96 },
          { month: 'May', premiums: 231, claims: 103 },
          { month: 'Jun', premiums: 248, claims: 111 },
        ],
        distribution: [
          { label: 'Health', value: 30, color: '#2563eb' },
          { label: 'Auto', value: 30, color: '#7c3aed' },
          { label: 'Life', value: 20, color: '#0f766e' },
          { label: 'Property', value: 20, color: '#f59e0b' },
        ],
      },
      activityRows: [
        { id: 'CLM-1169', name: 'Aiden Ross', category: 'Claim', date: '2026-07-29', amount: '$3,980', status: 'Pending' },
        { id: 'POL-2050', name: 'Emma Ford', category: 'Policy', date: '2026-07-27', amount: '$1,250', status: 'Active' },
        { id: 'PAY-903', name: 'Daniel Cruz', category: 'Payment', date: '2026-07-25', amount: '$420', status: 'Approved' },
        { id: 'CLM-1172', name: 'Olivia Grant', category: 'Claim', date: '2026-07-18', amount: '$4,600', status: 'Under Review' },
      ],
      auditLogs: [],
      pendingClaims: [
        { title: 'Hospital discharge documents', customer: 'Jordan Lee', priority: 'High' },
        { title: 'Vehicle inspection report', customer: 'Marcus Hall', priority: 'Medium' },
        { title: 'Income verification', customer: 'Nina Flores', priority: 'High' },
      ],
      renewals: [
        { customer: 'Riley Scott', policy: 'Life Shield', days: '14 days' },
        { customer: 'Carmen Diaz', policy: 'Auto Plus', days: '22 days' },
        { customer: 'Stephen Cole', policy: 'Home Guard', days: '29 days' },
      ],
    },
    CUSTOMER: {
      title: 'Policy & Claim Summary',
      metrics: [
        { label: 'Active Policies', value: '3', change: 'All covered', icon: 'ShieldCheck', accent: 'from-indigo-500 to-violet-500' },
        { label: 'Coverage Amount', value: '$485K', change: '+$12K annual', icon: 'Building2', accent: 'from-emerald-500 to-teal-500' },
        { label: 'Upcoming Due Dates', value: '2', change: 'Next 14 days', icon: 'CreditCard', accent: 'from-sky-500 to-cyan-500' },
        { label: 'Claims in Progress', value: '1', change: 'Under review', icon: 'FileText', accent: 'from-amber-500 to-orange-500' },
      ],
      chartData: {
        monthly: [
          { month: 'Jan', premiums: 70, claims: 42 },
          { month: 'Feb', premiums: 74, claims: 48 },
          { month: 'Mar', premiums: 78, claims: 45 },
          { month: 'Apr', premiums: 85, claims: 50 },
          { month: 'May', premiums: 90, claims: 56 },
          { month: 'Jun', premiums: 96, claims: 60 },
        ],
        distribution: [
          { label: 'Health', value: 40, color: '#2563eb' },
          { label: 'Auto', value: 25, color: '#7c3aed' },
          { label: 'Life', value: 20, color: '#0f766e' },
          { label: 'Property', value: 15, color: '#f59e0b' },
        ],
      },
      activityRows: [
        { id: 'POL-2029', name: 'You', category: 'Policy', date: '2026-07-30', amount: '$1,200', status: 'Active' },
        { id: 'CLM-1184', name: 'You', category: 'Claim', date: '2026-07-24', amount: '$8,920', status: 'Pending' },
        { id: 'PAY-881', name: 'You', category: 'Payment', date: '2026-07-20', amount: '$540', status: 'Approved' },
      ],
      auditLogs: [],
      pendingClaims: [
        { title: 'Claim #CLM-1184', customer: 'You', priority: 'Medium' },
      ],
      renewals: [
        { customer: 'You', policy: 'Life Shield', days: '14 days' },
        { customer: 'You', policy: 'Auto Plus', days: '22 days' },
      ],
    },
  };

  return {
    role: normalizedRole,
    title: roleConfig[normalizedRole]?.title || roleConfig.ADMIN.title,
    metrics: roleConfig[normalizedRole]?.metrics || roleConfig.ADMIN.metrics,
    chartData: roleConfig[normalizedRole]?.chartData || roleConfig.ADMIN.chartData,
    activityRows: roleConfig[normalizedRole]?.activityRows || roleConfig.ADMIN.activityRows,
    auditLogs: roleConfig[normalizedRole]?.auditLogs || roleConfig.ADMIN.auditLogs,
    pendingClaims: roleConfig[normalizedRole]?.pendingClaims || roleConfig.ADMIN.pendingClaims,
    renewals: roleConfig[normalizedRole]?.renewals || roleConfig.ADMIN.renewals,
  };
};

exports.getDashboardData = async (req, res) => {
  try {
    const role = (req.query.role || req.user?.role || 'ADMIN').toUpperCase();

    // Try to fetch real data from the database. If that fails, return the seeded payload.
    try {
      // Aggregate counts
      const [policiesCount, claimsCount, paymentsCount, usersCount] = await Promise.all([
        prisma.policy.count(),
        prisma.claim.count(),
        prisma.premiumPayment.count(),
        prisma.user.count(),
      ]);

      // Recent activity: latest claims and policies
      const recentClaims = await prisma.claim.findMany({ take: 5, orderBy: { submissionDate: 'desc' }, include: { policy: { include: { customer: true } } } });
      const recentPolicies = await prisma.policy.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } });
      const recentPayments = await prisma.premiumPayment.findMany({ take: 5, orderBy: { paymentDate: 'desc' }, include: { policy: { include: { customer: true } } } });

      // Build metrics using DB values
      const payload = buildDashboardPayload(role);
      payload.metrics = payload.metrics.map((m) => ({ ...m }));
      // Overwrite a few metrics with real counts where sensible
      if (payload.metrics[0]) payload.metrics[0].value = `${policiesCount ? policiesCount : payload.metrics[0].value}`;
      if (payload.metrics[1]) payload.metrics[1].value = `${paymentsCount ? paymentsCount : payload.metrics[1].value}`;
      if (payload.metrics[2]) payload.metrics[2].value = `${claimsCount ? claimsCount : payload.metrics[2].value}`;

      // Activity rows combined
      const activityRows = [];
      recentPolicies.forEach((p) => activityRows.push({ id: p.policyNumber || p.id, name: p.customer?.name || 'Unknown', category: 'Policy', date: p.createdAt?.toISOString().split('T')[0], amount: `$${p.premiumAmount || 0}`, status: p.status }));
      recentClaims.forEach((c) => activityRows.push({ id: c.id, name: c.policy?.customer?.name || 'Unknown', category: 'Claim', date: c.submissionDate?.toISOString().split('T')[0], amount: `$${c.claimAmount || 0}`, status: c.status }));
      recentPayments.forEach((pay) => activityRows.push({ id: pay.id, name: pay.policy?.customer?.name || 'Unknown', category: 'Payment', date: pay.paymentDate?.toISOString().split('T')[0], amount: `$${pay.amount || 0}`, status: pay.paymentStatus }));

      payload.activityRows = activityRows.slice(0, 10);
      payload.auditLogs = payload.auditLogs || [];
      payload.pendingClaims = payload.pendingClaims || [];
      payload.renewals = payload.renewals || [];

      return res.status(200).json(payload);
    } catch (dbError) {
      console.warn('Dashboard DB query failed, returning seeded payload:', dbError.message);
      const payload = buildDashboardPayload(role);
      return res.status(200).json(payload);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load dashboard data.', error: error.message });
  }
};
