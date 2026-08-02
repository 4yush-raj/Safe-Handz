import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  AlertTriangle,
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
  const { user } = useAuth();
  const currentUserRole = (user?.role || userRole).toUpperCase();

  const [selectedRole, setSelectedRole] = useState(currentUserRole);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showIssuePolicyModal, setShowIssuePolicyModal] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    phone: '',
    address: ''
  });

  const [policyForm, setPolicyForm] = useState({
    customerId: '',
    policyType: 'Health',
    policyNumber: '',
    premiumAmount: '',
    startDate: '',
    endDate: ''
  });

  const activeRole = roleOptions.includes(selectedRole) ? selectedRole : 'ADMIN';
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/dashboard?role=${activeRole}`);
      if (!response.ok) {
        throw new Error('Unable to load dashboard from the server.');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomersList(data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    setSelectedRole(currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    loadDashboard();
    if (activeRole === 'AGENT' || activeRole === 'ADMIN') {
      fetchCustomers();
    }
  }, [activeRole]);

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    try {
      if (!registerForm.name || !registerForm.email || !registerForm.password) {
        setModalError('Name, Email and Password are required.');
        return;
      }
      await api.register(
        registerForm.name,
        registerForm.email,
        registerForm.password,
        'CUSTOMER',
        registerForm.dob,
        registerForm.phone,
        registerForm.address
      );
      setModalSuccess('Customer registered successfully!');
      setRegisterForm({ name: '', email: '', password: '', dob: '', phone: '', address: '' });
      fetchCustomers();
      loadDashboard();
    } catch (err) {
      setModalError(err.message || 'Registration failed.');
    }
  };

  const handleIssuePolicy = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    try {
      if (!policyForm.customerId || !policyForm.policyNumber || !policyForm.premiumAmount || !policyForm.startDate || !policyForm.endDate) {
        setModalError('All fields are required to issue a policy.');
        return;
      }
      await api.createPolicy({
        customerId: policyForm.customerId,
        policyType: policyForm.policyType,
        policyNumber: policyForm.policyNumber,
        premiumAmount: parseFloat(policyForm.premiumAmount),
        startDate: policyForm.startDate,
        endDate: policyForm.endDate
      });
      setModalSuccess('Policy issued successfully!');
      setPolicyForm({
        customerId: '',
        policyType: 'Health',
        policyNumber: '',
        premiumAmount: '',
        startDate: '',
        endDate: ''
      });
      loadDashboard();
    } catch (err) {
      setModalError(err.message || 'Failed to issue policy.');
    }
  };

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
        <header className="rounded-[28px] border border-slate-800 bg-slate-900 p-4 shadow-xl text-white sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-400">Insurance Operations Suite</p>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{roleTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                A responsive, enterprise-grade dashboard for policy oversight, claims execution, and client engagement.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-indigo-200 border border-slate-850">
                  <User2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{user?.name || 'Alicia Reed'}</p>
                  <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-indigo-400 border border-indigo-500/15">
                    {activeRole}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 hover:bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Go back"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {roleOptions
            .filter((role) => role === currentUserRole)
            .map((role) => (
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
                  <button 
                    onClick={() => { setShowRegisterModal(true); setModalError(''); setModalSuccess(''); }}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Register Customer
                  </button>
                  <button 
                    onClick={() => { setShowIssuePolicyModal(true); setModalError(''); setModalSuccess(''); }}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Issue Policy
                  </button>
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

                </div>
              </div>
            )}


          </div>
        </section>
      </div>

      {/* Modal: Register Customer */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md animate-scale-in text-left">
            <h3 className="text-xl font-semibold text-slate-900">Register New Customer</h3>
            <p className="text-sm text-slate-600 mt-1">Create a user account and customer profile for a new client.</p>
            
            {modalError && <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">{modalError}</div>}
            {modalSuccess && <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700">{modalSuccess}</div>}
            
            <form onSubmit={handleRegisterCustomer} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Password *</label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                  <input
                    type="date"
                    value={registerForm.dob}
                    onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="000-000-0000"
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Home Address</label>
                <textarea
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  placeholder="Street name, City, Zip"
                  rows={2}
                  className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Policy */}
      {showIssuePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md animate-scale-in text-left">
            <h3 className="text-xl font-semibold text-slate-900">Issue Insurance Policy</h3>
            <p className="text-sm text-slate-600 mt-1">Configure and issue a new insurance coverage policy for a registered customer.</p>
            
            {modalError && <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">{modalError}</div>}
            {modalSuccess && <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700">{modalSuccess}</div>}
            
            <form onSubmit={handleIssuePolicy} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Select Customer *</label>
                <select
                  required
                  value={policyForm.customerId}
                  onChange={(e) => setPolicyForm({ ...policyForm, customerId: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Choose Customer --</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Policy Type *</label>
                  <select
                    required
                    value={policyForm.policyType}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyType: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Health">Health</option>
                    <option value="Auto">Auto</option>
                    <option value="Life">Life</option>
                    <option value="Property">Property</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Policy Number *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.policyNumber}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                    placeholder="POL-XXXXX"
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Premium Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={policyForm.premiumAmount}
                  onChange={(e) => setPolicyForm({ ...policyForm, premiumAmount: e.target.value })}
                  placeholder="1200.00"
                  className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={policyForm.startDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, startDate: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">End Date *</label>
                  <input
                    type="date"
                    required
                    value={policyForm.endDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, endDate: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssuePolicyModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Issue Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InsuranceDashboard;
