import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  FileText,
  HeartPulse,
  House,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  User2,
  Users,
} from 'lucide-react';

const roleOptions = ['ADMIN', 'AGENT', 'CUSTOMER'];

const adminMetrics = [
  { label: 'Total Revenue', value: '$2.84M', change: '+12.5% this month', icon: CircleDollarSign, accent: 'from-emerald-500 to-teal-500' },
  { label: 'Active Policies', value: '18.2K', change: '+8.1% this month', icon: ShieldCheck, accent: 'from-indigo-500 to-violet-500' },
  { label: 'Claims Pending', value: '342', change: '-4.3% today', icon: AlertTriangle, accent: 'from-amber-500 to-orange-500' },
  { label: 'Customers Onboarded', value: '9,751', change: '+16.2% this month', icon: Users, accent: 'from-sky-500 to-cyan-500' },
];

const agentMetrics = [
  { label: 'Pending Verifications', value: '47', change: '7 urgent', icon: FileText, accent: 'from-amber-500 to-orange-500' },
  { label: 'Renewals Due (30d)', value: '126', change: '12 high-value', icon: Clock3, accent: 'from-sky-500 to-cyan-500' },
  { label: 'Policies Issued', value: '314', change: '+9.4% week', icon: BriefcaseBusiness, accent: 'from-emerald-500 to-teal-500' },
  { label: 'Customer Satisfaction', value: '94%', change: 'Excellent', icon: Sparkles, accent: 'from-violet-500 to-fuchsia-500' },
];

const customerMetrics = [
  { label: 'Active Policies', value: '3', change: 'All covered', icon: ShieldCheck, accent: 'from-indigo-500 to-violet-500' },
  { label: 'Coverage Amount', value: '$485K', change: '+$12K annual', icon: Building2, accent: 'from-emerald-500 to-teal-500' },
  { label: 'Upcoming Due Dates', value: '2', change: 'Next 14 days', icon: CreditCard, accent: 'from-sky-500 to-cyan-500' },
  { label: 'Claims in Progress', value: '1', change: 'Under review', icon: FileText, accent: 'from-amber-500 to-orange-500' },
];

const monthlyData = [
  { month: 'Jan', premiums: 180, claims: 82 },
  { month: 'Feb', premiums: 205, claims: 93 },
  { month: 'Mar', premiums: 228, claims: 87 },
  { month: 'Apr', premiums: 252, claims: 104 },
  { month: 'May', premiums: 274, claims: 112 },
  { month: 'Jun', premiums: 298, claims: 121 },
];

const distributionData = [
  { label: 'Health', value: 35, color: '#2563eb' },
  { label: 'Auto', value: 25, color: '#7c3aed' },
  { label: 'Life', value: 20, color: '#0f766e' },
  { label: 'Property', value: 20, color: '#f59e0b' },
];

const fallbackActivityRows = [
  { id: 'POL-2048', name: 'Maya Chen', category: 'Policy', date: '2026-07-26', amount: '$2,340', status: 'Active' },
  { id: 'CLM-1184', name: 'Liam Ortiz', category: 'Claim', date: '2026-07-24', amount: '$8,920', status: 'Pending' },
  { id: 'PAY-881', name: 'Sofia Patel', category: 'Payment', date: '2026-07-20', amount: '$540', status: 'Approved' },
  { id: 'CLM-1155', name: 'Noah Kim', category: 'Claim', date: '2026-07-15', amount: '$6,250', status: 'Rejected' },
  { id: 'POL-2031', name: 'Ava Brooks', category: 'Policy', date: '2026-07-12', amount: '$1,880', status: 'Overdue' },
];

const auditLogs = [
  { title: 'Fraud review completed', detail: 'Risk module verified 14 high-risk claims.', time: '12 mins ago' },
  { title: 'Policy template updated', detail: 'New bundled coverage options published to the portal.', time: '1 hr ago' },
  { title: 'Customer onboarding synced', detail: '1,240 new accounts imported successfully.', time: '3 hrs ago' },
];

const pendingClaims = [
  { title: 'Hospital discharge documents', customer: 'Jordan Lee', priority: 'High' },
  { title: 'Vehicle inspection report', customer: 'Marcus Hall', priority: 'Medium' },
  { title: 'Income verification', customer: 'Nina Flores', priority: 'High' },
];

const renewals = [
  { customer: 'Riley Scott', policy: 'Life Shield', days: '14 days' },
  { customer: 'Carmen Diaz', policy: 'Auto Plus', days: '22 days' },
  { customer: 'Stephen Cole', policy: 'Home Guard', days: '29 days' },
];

const claimSteps = ['Submitted', 'Reviewed', 'Approved', 'Payout scheduled'];
const claimCurrentStep = 2;

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Approved: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  Overdue: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  'Under Review': 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
};

const iconMap = {
  CircleDollarSign,
  ShieldCheck,
  AlertTriangle,
  Users,
  FileText,
  Clock3,
  BriefcaseBusiness,
  Sparkles,
  Building2,
  CreditCard,
};

function InsuranceDashboard({ userRole = 'ADMIN' }) {
  const [selectedRole, setSelectedRole] = useState(userRole.toUpperCase());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeRole = roleOptions.includes(selectedRole) ? selectedRole : 'ADMIN';
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/dashboard?role=${activeRole}`);
        if (!response.ok) {
          throw new Error('Unable to load dashboard from the server.');
        }
        const data = await response.json();
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard data.');
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  const metrics = useMemo(() => {
    const source = dashboardData?.metrics?.length ? dashboardData.metrics : null;
    if (source) {
      return source.map((item) => ({
        ...item,
        icon: iconMap[item.icon] || ShieldCheck,
      }));
    }

    switch (activeRole) {
      case 'AGENT':
        return agentMetrics;
      case 'CUSTOMER':
        return customerMetrics;
      default:
        return adminMetrics;
    }
  }, [activeRole, dashboardData]);

  const activityRows = useMemo(() => {
    return dashboardData?.activityRows || fallbackActivityRows;
  }, [dashboardData]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activityRows.filter((row) => {
      const matchesFilter = filter === 'All' || row.category === filter;
      const matchesSearch = !query || [row.id, row.name, row.category, row.status].some((value) => value.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, activityRows]);

  const chartData = dashboardData?.chartData || {
    monthly: monthlyData,
    distribution: distributionData,
  };

  const auditItems = dashboardData?.auditLogs || auditLogs;
  const queueItems = dashboardData?.pendingClaims || pendingClaims;
  const renewalItems = dashboardData?.renewals || renewals;

  const roleTitle = dashboardData?.title || {
    ADMIN: 'Executive Operations Overview',
    AGENT: 'Claims & Renewal Command Center',
    CUSTOMER: 'Policy & Claim Summary',
  }[activeRole];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Insurance Operations Suite</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{roleTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                A responsive, enterprise-grade dashboard for policy oversight, claims execution, and client engagement.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search records"
                  className="w-32 bg-transparent outline-none sm:w-40"
                />
              </div>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              </button>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  <User2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Alicia Reed</p>
                  <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                    {activeRole}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                title="Go back"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {roleOptions.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedRole === role
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-300'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {role === 'ADMIN' ? 'Admin Preview' : role === 'AGENT' ? 'Agent Preview' : 'Customer Preview'}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${item.accent} p-3 text-white`}>
                  <Icon size={18} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <TrendingUp size={12} />
                    {item.change}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Performance Overview</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Premiums collected vs. claims paid</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Monthly</div>
            </div>
            <div className="mt-6 flex h-56 items-end gap-3">
              {chartData.monthly.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-40 w-full items-end gap-2">
                    <div className="flex-1 rounded-t-xl bg-slate-900" style={{ height: `${Math.max(item.premiums / 3, 12)}%` }}></div>
                    <div className="flex-1 rounded-t-xl bg-indigo-500" style={{ height: `${Math.max(item.claims / 2.5, 12)}%` }}></div>
                  </div>
                  <div className="text-center text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{item.month}</p>
                    <p>$ {item.premiums}k</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Policy Distribution</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Cover types mix</h2>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
                  {chartData.distribution.map((slice, index) => {
                    const radius = 44;
                    const circumference = 2 * Math.PI * radius;
                    const offset = chartData.distribution.slice(0, index).reduce((acc, item) => acc + (item.value / 100) * circumference, 0);
                    return (
                      <circle
                        key={slice.label}
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke={slice.color}
                        strokeWidth="18"
                        strokeDasharray={`${(slice.value / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-offset}
                        fill="transparent"
                      />
                    );
                  })}
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-semibold text-slate-900">100%</p>
                  <p className="text-sm text-slate-500">Active mix</p>
                </div>
              </div>
              <div className="w-full space-y-2">
                {chartData.distribution.map((slice) => (
                  <div key={slice.label} className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }}></span>
                      {slice.label}
                    </div>
                    <span className="font-semibold text-slate-900">{slice.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Recent Activity</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Operational feed</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Policy', 'Claim', 'Payment'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      filter === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Policy / Claim ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.id}</td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3 text-slate-600">{row.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            {activeRole === 'ADMIN' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-semibold text-slate-500">Recent Audit Logs</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Platform governance</h2>
                <div className="mt-4 space-y-3">
                  {auditItems.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <span className="text-xs text-slate-500">{item.time}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeRole === 'AGENT' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-semibold text-slate-500">Priority Queue</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Pending claim verification</h2>
                <div className="mt-4 space-y-3">
                  {queueItems.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.priority}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">Customer: {item.customer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Register Customer</button>
                  <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Issue Policy</button>
                </div>
              </div>
            )}

            {activeRole === 'CUSTOMER' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-semibold text-slate-500">Claim Progress</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Your active claim</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold text-slate-900">Claim #CLM-1184</p>
                      <p className="text-sm text-slate-600">Medical claim · $8,920</p>
                    </div>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">Reviewing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {claimSteps.map((step, index) => {
                      const isComplete = index <= claimCurrentStep;
                      return (
                        <div key={step} className="flex flex-1 flex-col items-center text-center">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isComplete ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {isComplete ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                          </div>
                          <p className={`mt-2 text-xs font-semibold ${isComplete ? 'text-emerald-700' : 'text-slate-500'}`}>{step}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Pay Premium</button>
                    <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Upload Document</button>
                    <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Download PDF</button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Upcoming Focus</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Renewal alerts</h2>
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-sm font-semibold text-rose-700">30 days</span>
              </div>
              <div className="mt-4 space-y-3">
                {renewalItems.map((item) => (
                  <div key={`${item.customer}-${item.policy || ''}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.customer}</p>
                      <p className="text-sm text-slate-600">{item.policy}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{item.days}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default InsuranceDashboard;
