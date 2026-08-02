const prisma = require('../prismaClient');

// Helper to format currency values cleanly (e.g. $2.84M, $45.2K, $820)
const formatMoney = (amount) => {
  if (!amount) return '$0';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

// Helper to scale absolute values to thousands for the monthly charts
const toThousands = (amount) => {
  if (!amount) return 0;
  const val = amount / 1000;
  return val >= 1 ? Math.round(val) : parseFloat(val.toFixed(1));
};

// Helper to generate date ranges for the last 6 calendar months
const getLast6Months = () => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      name: monthNames[d.getMonth()],
      year: d.getFullYear(),
      monthNum: d.getMonth(),
      startDate: new Date(d.getFullYear(), d.getMonth(), 1),
      endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    });
  }
  return months;
};

// Seed payload fallback configurations
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
    const payload = buildDashboardPayload(role);

    // Try to fetch real data from the database. If that fails, return the seeded payload.
    try {
      let customerId = null;

      // If user requests CUSTOMER preview, resolve the customer scope
      if (role === 'CUSTOMER') {
        if (req.user) {
          const customer = await prisma.customer.findUnique({
            where: { userId: req.user.id }
          });
          if (customer) {
            customerId = customer.id;
          }
        }

        // Preview fallback: if the logged-in user isn't a CUSTOMER (e.g. Admin previewing)
        // or has no profile yet, bind to the first customer in the DB so they see realistic data
        if (!customerId) {
          const firstCustomer = await prisma.customer.findFirst();
          if (firstCustomer) {
            customerId = firstCustomer.id;
          }
        }
      }

      // --- CALCULATE DYNAMIC METRICS ---
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      const metricsCopy = payload.metrics.map(m => ({ ...m }));

      if (role === 'ADMIN') {
        // 1. Total Revenue (Sum of Completed Payments)
        const paymentSum = await prisma.premiumPayment.aggregate({
          where: { paymentStatus: 'COMPLETED' },
          _sum: { amount: true }
        });
        metricsCopy[0].value = formatMoney(paymentSum._sum.amount || 0);

        // 2. Active Policies
        const activeCount = await prisma.policy.count({ where: { status: 'ACTIVE' } });
        metricsCopy[1].value = activeCount >= 1000 ? `${(activeCount / 1000).toFixed(1)}K` : String(activeCount);

        // 3. Claims Pending
        const pendingClaimsCount = await prisma.claim.count({
          where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
        });
        metricsCopy[2].value = String(pendingClaimsCount);

        // 4. Customers Onboarded
        const totalCustomers = await prisma.customer.count();
        metricsCopy[3].value = totalCustomers.toLocaleString();

      } else if (role === 'AGENT') {
        // 1. Pending Verifications (Pending Claims + Pending Policies)
        const pendingClaimsCount = await prisma.claim.count({
          where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
        });
        const pendingPoliciesCount = await prisma.policy.count({
          where: { status: 'PENDING' }
        });
        metricsCopy[0].value = String(pendingClaimsCount + pendingPoliciesCount);

        // 2. Renewals Due (30d)
        const renewalsCount = await prisma.policy.count({
          where: {
            status: 'ACTIVE',
            endDate: { gte: now, lte: thirtyDaysLater }
          }
        });
        metricsCopy[1].value = String(renewalsCount);

        // 3. Policies Issued (Total Active Policies)
        const activeCount = await prisma.policy.count({ where: { status: 'ACTIVE' } });
        metricsCopy[2].value = String(activeCount);

        // 4. Customer Satisfaction (Static standard metric)
        // Keep standard seeded value

      } else if (role === 'CUSTOMER') {
        if (customerId) {
          // 1. Active Policies
          const activeCount = await prisma.policy.count({
            where: { customerId, status: 'ACTIVE' }
          });
          metricsCopy[0].value = String(activeCount);

          // 2. Coverage Amount (Sum of premiums for active policies)
          const coverageSum = await prisma.policy.aggregate({
            where: { customerId, status: 'ACTIVE' },
            _sum: { premiumAmount: true }
          });
          metricsCopy[1].value = formatMoney(coverageSum._sum.premiumAmount || 0);

          // 3. Upcoming Due Dates (Active policies ending in next 30 days)
          const renewalsCount = await prisma.policy.count({
            where: {
              customerId,
              status: 'ACTIVE',
              endDate: { gte: now, lte: thirtyDaysLater }
            }
          });
          metricsCopy[2].value = String(renewalsCount);

          // 4. Claims in Progress
          const claimsCount = await prisma.claim.count({
            where: {
              policy: { customerId },
              status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
            }
          });
          metricsCopy[3].value = String(claimsCount);
        } else {
          // Reset to zeros if no customers in DB
          metricsCopy[0].value = '0';
          metricsCopy[1].value = '$0';
          metricsCopy[2].value = '0';
          metricsCopy[3].value = '0';
        }
      }

      payload.metrics = metricsCopy;

      // --- CALCULATE PERFORMANCE OVERVIEW (MONTHLY GRAPH) ---
      const months = getLast6Months();
      const dynamicMonthly = await Promise.all(months.map(async (m) => {
        // Sum completed premiums in the month
        const premiumWhere = {
          paymentStatus: 'COMPLETED',
          paymentDate: { gte: m.startDate, lte: m.endDate }
        };
        if (role === 'CUSTOMER' && customerId) {
          premiumWhere.policy = { customerId };
        }
        const premiumSum = await prisma.premiumPayment.aggregate({
          where: premiumWhere,
          _sum: { amount: true }
        });

        // Sum approved claims in the month
        const claimWhere = {
          status: 'APPROVED',
          submissionDate: { gte: m.startDate, lte: m.endDate }
        };
        if (role === 'CUSTOMER' && customerId) {
          claimWhere.policy = { customerId };
        }
        const claimSum = await prisma.claim.aggregate({
          where: claimWhere,
          _sum: { claimAmount: true }
        });

        return {
          month: m.name,
          premiums: toThousands(premiumSum._sum.amount || 0),
          claims: toThousands(claimSum._sum.claimAmount || 0)
        };
      }));

      // Use dynamic data if there's any transaction history, otherwise fall back to seeded values
      const hasGraphData = dynamicMonthly.some(d => d.premiums > 0 || d.claims > 0);
      if (hasGraphData) {
        payload.chartData.monthly = dynamicMonthly;
      }

      // --- CALCULATE POLICY DISTRIBUTION (COVER TYPES DONUT GRAPH) ---
      const distWhere = { status: 'ACTIVE' };
      if (role === 'CUSTOMER' && customerId) {
        distWhere.customerId = customerId;
      }

      const activePolicies = await prisma.policy.findMany({
        where: distWhere,
        select: { policyType: true }
      });

      const counts = { Health: 0, Auto: 0, Life: 0, Property: 0 };
      activePolicies.forEach(p => {
        const typeNormalized = p.policyType.charAt(0).toUpperCase() + p.policyType.slice(1).toLowerCase();
        if (counts.hasOwnProperty(typeNormalized)) {
          counts[typeNormalized]++;
        }
      });

      const totalActive = activePolicies.length;
      const dynamicDistribution = [
        { label: 'Health', value: totalActive > 0 ? Math.round((counts.Health / totalActive) * 100) : 0, color: '#2563eb' },
        { label: 'Auto', value: totalActive > 0 ? Math.round((counts.Auto / totalActive) * 100) : 0, color: '#7c3aed' },
        { label: 'Life', value: totalActive > 0 ? Math.round((counts.Life / totalActive) * 100) : 0, color: '#0f766e' },
        { label: 'Property', value: totalActive > 0 ? Math.round((counts.Property / totalActive) * 100) : 0, color: '#f59e0b' }
      ];

      const hasDistData = dynamicDistribution.some(d => d.value > 0);
      if (hasDistData) {
        payload.chartData.distribution = dynamicDistribution;
      }

      // --- DYNAMIC RECENT ACTIVITY FEED ---
      const claimQuery = { take: 5, orderBy: { submissionDate: 'desc' }, include: { policy: { include: { customer: true } } } };
      const policyQuery = { take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } };
      const paymentQuery = { take: 5, orderBy: { paymentDate: 'desc' }, include: { policy: { include: { customer: true } } } };

      if (role === 'CUSTOMER' && customerId) {
        claimQuery.where = { policy: { customerId } };
        policyQuery.where = { customerId };
        paymentQuery.where = { policy: { customerId } };
      }

      const [recentClaims, recentPolicies, recentPayments] = await Promise.all([
        prisma.claim.findMany(claimQuery),
        prisma.policy.findMany(policyQuery),
        prisma.premiumPayment.findMany(paymentQuery)
      ]);

      const activityRows = [];
      recentPolicies.forEach((p) => {
        activityRows.push({
          id: p.policyNumber || p.id,
          name: p.customer?.name || 'Unknown',
          category: 'Policy',
          date: p.createdAt?.toISOString().split('T')[0],
          amount: `$${p.premiumAmount.toLocaleString()}`,
          status: p.status === 'ACTIVE' ? 'Active' : p.status === 'PENDING' ? 'Pending' : p.status === 'EXPIRED' ? 'Expired' : 'Cancelled'
        });
      });

      recentClaims.forEach((c) => {
        const statusMap = {
          SUBMITTED: 'Pending',
          UNDER_REVIEW: 'Under Review',
          APPROVED: 'Approved',
          REJECTED: 'Rejected'
        };
        activityRows.push({
          id: `CLM-${c.id.slice(0,4).toUpperCase()}`,
          name: c.policy?.customer?.name || 'Unknown',
          category: 'Claim',
          date: c.submissionDate?.toISOString().split('T')[0],
          amount: `$${c.claimAmount.toLocaleString()}`,
          status: statusMap[c.status] || 'Pending'
        });
      });

      recentPayments.forEach((pay) => {
        activityRows.push({
          id: `PAY-${pay.id.slice(0,4).toUpperCase()}`,
          name: pay.policy?.customer?.name || 'Unknown',
          category: 'Payment',
          date: pay.paymentDate?.toISOString().split('T')[0],
          amount: `$${pay.amount.toLocaleString()}`,
          status: pay.paymentStatus === 'COMPLETED' ? 'Approved' : pay.paymentStatus === 'PENDING' ? 'Pending' : 'Rejected'
        });
      });

      // Sort combined activity feed by date desc
      activityRows.sort((a, b) => new Date(b.date) - new Date(a.date));
      payload.activityRows = activityRows.slice(0, 10);

      // --- SIDEBAR DATA (PENDING CLAIMS QUEUE & RENEWALS) ---
      if (role === 'ADMIN' || role === 'AGENT') {
        // Pending Claims Priority Queue
        const pendingClaimsList = await prisma.claim.findMany({
          where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
          include: { policy: { include: { customer: true } } },
          orderBy: { submissionDate: 'asc' },
          take: 5
        });

        payload.pendingClaims = pendingClaimsList.map(c => ({
          title: c.reason || 'Insurance Claim',
          customer: c.policy?.customer?.name || 'Unknown',
          priority: c.claimAmount >= 5000 ? 'High' : 'Medium'
        }));

        // Renewals List
        const renewalsList = await prisma.policy.findMany({
          where: {
            status: 'ACTIVE',
            endDate: { gte: now, lte: thirtyDaysLater }
          },
          include: { customer: true },
          orderBy: { endDate: 'asc' },
          take: 5
        });

        payload.renewals = renewalsList.map(p => {
          const diffTime = Math.abs(p.endDate - now);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            customer: p.customer?.name || 'Unknown',
            policy: `${p.policyType} Cover`,
            days: `${diffDays} days`
          };
        });
      } else if (role === 'CUSTOMER' && customerId) {
        // Customer active claim progress
        const activeClaim = await prisma.claim.findFirst({
          where: {
            policy: { customerId },
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] }
          },
          orderBy: { submissionDate: 'desc' }
        });

        if (activeClaim) {
          payload.pendingClaims = [{
            title: `Claim #CLM-${activeClaim.id.slice(0,4).toUpperCase()}`,
            customer: 'You',
            priority: activeClaim.status === 'SUBMITTED' ? 'Medium' : 'High'
          }];
        } else {
          payload.pendingClaims = [];
        }

        // Customer upcoming renewals
        const customerRenewals = await prisma.policy.findMany({
          where: {
            customerId,
            status: 'ACTIVE',
            endDate: { gte: now, lte: thirtyDaysLater }
          },
          orderBy: { endDate: 'asc' },
          take: 3
        });

        payload.renewals = customerRenewals.map(p => {
          const diffTime = Math.abs(p.endDate - now);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            customer: 'You',
            policy: `${p.policyType} Cover`,
            days: `${diffDays} days`
          };
        });
      }

      return res.status(200).json(payload);
    } catch (dbError) {
      console.warn('Dashboard DB query failed, returning seeded payload:', dbError.message);
      return res.status(200).json(payload);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load dashboard data.', error: error.message });
  }
};
