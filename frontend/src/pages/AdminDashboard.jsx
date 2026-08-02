import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Shield, LogOut, FileText, AlertCircle, CreditCard, Users,
  CheckCircle2, XCircle, Clock3, Search, MessageSquare,
  Calendar, Inbox, RefreshCw, ChevronRight, User, TrendingUp, DollarSign, FolderOpen
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data States
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);

  // Support composition states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusMap, setStatusMap] = useState({});

  // Client Documents States
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDocuments, setClientDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Agent Profile States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters & Searches
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); 
  const [policyFilter, setPolicyFilter] = useState('ALL'); 
  const [claimFilter, setClaimFilter] = useState('ALL'); 
  const [clientSearch, setClientSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const promises = [
        api.getPolicies(),
        api.getClaims(),
        api.getPayments(),
        api.getMessages(),
        api.getCustomers().catch(() => []),
      ];
      if (isAdmin) {
        promises.push(api.getAgents().catch(() => []));
      } else {
        // If they are an Agent, fetch their profile details
        api.getProfile().then((profileData) => {
          if (profileData) {
            setProfileName(profileData.name || '');
            setProfilePhone(profileData.phone || '');
            setProfileDob(profileData.dob ? profileData.dob.split('T')[0] : '');
            setProfileAddress(profileData.address || '');
          }
        }).catch(() => {});
      }

      const results = await Promise.all(promises);
      
      setPolicies(results[0] || []);
      setClaims(results[1] || []);
      setPayments(results[2] || []);
      setMessages(results[3] || []);
      setClients(results[4] || []);
      if (isAdmin) {
        setAgents(results[5] || []);
      } else {
        setAgents([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const totalRevenue = useMemo(() => {
    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  }, [payments]);

  const summary = useMemo(() => ({
    policies: policies.length,
    claims: claims.length,
    payments: payments.length,
    revenue: totalRevenue
  }), [policies, claims, payments, totalRevenue]);

  const updateClaimStatus = async (claimId, nextStatus) => {
    try {
      await api.updateClaimStatus(claimId, nextStatus);
      setStatusMap((prev) => ({ ...prev, [claimId]: nextStatus }));
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to update claim status.');
    }
  };

  const updatePolicyStatus = async (policyId, nextStatus) => {
    try {
      await api.updatePolicyStatus(policyId, nextStatus);
      setStatusMap((prev) => ({ ...prev, [policyId]: nextStatus }));
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to update policy status.');
    }
  };

  const handleSendMessage = async () => {
    setError('');
    setSuccess('');
    if (!messageText.trim()) {
      setError('Enter a message before sending.');
      return;
    }
    if (!selectedCustomerId) {
      setError('Select a customer to send the message to.');
      return;
    }

    try {
      await api.sendMessage(messageText.trim(), selectedCustomerId);
      setMessageText('');
      setSuccess('Message sent to client successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to send message.');
    }
  };

  const handleViewClientDocuments = async (customer) => {
    setSelectedClient(customer);
    setClientDocuments([]);
    setLoadingDocs(true);
    try {
      const docs = await api.getCustomerDocuments(customer.id);
      setClientDocuments(docs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer documents.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateProfile({
        name: profileName,
        dob: profileDob,
        phone: profilePhone,
        address: profileAddress
      });
      setSuccess('Profile details updated successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const pType = payment.policy?.policyType || '';
      const cName = payment.policy?.customer?.name || '';
      const cEmail = payment.policy?.customer?.email || '';
      const pNumber = payment.policy?.policyNumber || '';

      const matchesSearch = 
        cName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        cEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        pNumber.toLowerCase().includes(paymentSearch.toLowerCase());

      const matchesFilter = paymentFilter === 'ALL' || pType.toUpperCase() === paymentFilter.toUpperCase();

      return matchesSearch && matchesFilter;
    });
  }, [payments, paymentSearch, paymentFilter]);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      if (policyFilter === 'ALL') return true;
      return policy.status === policyFilter;
    });
  }, [policies, policyFilter]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (claimFilter === 'ALL') return true;
      return claim.status === claimFilter;
    });
  }, [claims, claimFilter]);

  // Filtered Clients (Customers)
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const name = client.name || '';
      const email = client.email || '';
      const phone = client.phone || '';
      return (
        name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        phone.includes(clientSearch)
      );
    });
  }, [clients, clientSearch]);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const name = agent.name || '';
      const email = agent.email || '';
      return (
        name.toLowerCase().includes(agentSearch.toLowerCase()) ||
        email.toLowerCase().includes(agentSearch.toLowerCase())
      );
    });
  }, [agents, agentSearch]);

  const getStatusBadge = (status) => {
    const s = status.toUpperCase();
    if (s === 'ACTIVE' || s === 'APPROVED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {status}
        </span>
      );
    }
    if (s === 'PENDING' || s === 'UNDER_REVIEW' || s === 'SUBMITTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-250">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-250">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-white shrink-0 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Safe Handz</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-550 font-bold mt-0.5">
              {isAdmin ? 'Admin Console' : 'Agent Workspace'}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-555 font-bold px-3 mb-2">Main Menu</p>
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>{isAdmin ? 'Clients & Agents' : 'Client Profiles'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {isAdmin ? clients.length + agents.length : clients.length}
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Policies</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'policies' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {policies.length}
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'claims' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4" />
              <span>Claims Management</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'claims' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {claims.length}
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>Premium Payments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'payments' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {payments.length}
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Support Messaging</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {!isAdmin && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-550 font-bold">System Status: Active</p>
        </div>
      </aside>

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'overview' && 'System Performance Overview'}
              {activeTab === 'users' && (isAdmin ? 'Subscriber & Staff Directories' : 'Subscriber Directory')}
              {activeTab === 'policies' && 'Insurance Policies Log'}
              {activeTab === 'claims' && 'Claims Audits & Verifications'}
              {activeTab === 'payments' && 'Premium Payments Ledger'}
              {activeTab === 'messages' && 'Support Messaging Service'}
              {activeTab === 'profile' && 'My Professional Profile'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back, your session is active.</p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border text-xs shadow-xs text-slate-800 uppercase ${
                isAdmin ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-purple-50 border-purple-200 text-purple-750'
              }`}>
                {user?.name?.[0] || 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-550 mt-0.5">{user?.role} Portal</p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/insurance-dashboard?role=${(user?.role || 'ADMIN')}`)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 hover:border-slate-350 text-xs font-bold rounded-lg text-slate-700 transition-all cursor-pointer shadow-xs"
                title="Open Operations Dashboard"
              >
                Visual Sandbox
              </button>
              <button
                onClick={loadData}
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-xs cursor-pointer"
                title="Refresh Database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-250 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-750 transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-550" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-800 font-bold text-xs">Close</button>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
              <button onClick={() => setSuccess('')} className="text-emerald-500 hover:text-emerald-850 font-bold text-xs">Close</button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-9 h-9 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-semibold">Loading data ledger...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* STATS CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-500 uppercase">Active Policies</span>
                        <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-600">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-extrabold text-slate-900">{summary.policies}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Total active policy covers</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-500 uppercase">Pending Claims</span>
                        <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-extrabold text-slate-900">{summary.claims}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Claims awaiting validation</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-500 uppercase">Premium Receipts</span>
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-extrabold text-slate-900">{summary.payments}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Total completed payments</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-500 uppercase">Total Revenue</span>
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-extrabold text-slate-900">${summary.revenue.toLocaleString()}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Total premiums collected</p>
                      </div>
                    </div>
                  </div>

                  {/* QUICK GLANCE SUMMARY PANELS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Policies */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Recent Policies</h3>
                        <button onClick={() => setActiveTab('policies')} className="text-xs font-bold text-indigo-650 hover:underline">View All</button>
                      </div>
                      <div className="space-y-3">
                        {policies.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-6">No policies registered.</p>
                        ) : (
                          policies.slice(0, 3).map((policy) => (
                            <div key={policy.id} className="p-3.5 border border-slate-150 rounded-2xl flex justify-between items-center gap-3">
                              <div>
                                <h4 className="text-xs font-extrabold text-slate-800">{policy.policyType} Policy</h4>
                                <p className="text-[10px] text-slate-550 mt-1 font-bold">{policy.policyNumber} · Client: {policy.customer?.name || 'N/A'}</p>
                              </div>
                              {getStatusBadge(policy.status)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Claims */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Recent Claims</h3>
                        <button onClick={() => setActiveTab('claims')} className="text-xs font-bold text-indigo-650 hover:underline">View All</button>
                      </div>
                      <div className="space-y-3">
                        {claims.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-6">No claims submitted.</p>
                        ) : (
                          claims.slice(0, 3).map((claim) => (
                            <div key={claim.id} className="p-3.5 border border-slate-150 rounded-2xl flex justify-between items-center gap-3">
                              <div>
                                <h4 className="text-xs font-extrabold text-slate-800 truncate max-w-[200px]">{claim.reason}</h4>
                                <p className="text-[10px] text-slate-550 mt-1 font-bold">${claim.claimAmount} · Policy: {claim.policy?.policyNumber || 'N/A'}</p>
                              </div>
                              {getStatusBadge(claim.status)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENTS & AGENTS */}
              {activeTab === 'users' && (
                <div className="space-y-8 text-left">
                  {/* CLIENTS SECTION */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Clients Directory</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Details of registered policyholders and document verification files.</p>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          placeholder="Search client details..."
                          className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs w-full sm:w-56 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-750">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-4">Client Name</th>
                            <th className="p-4">Email Address</th>
                            <th className="p-4">Contact Phone</th>
                            <th className="p-4 text-center">Date of birth</th>
                            <th className="p-4">Residential Address</th>
                            <th className="p-4 text-center">Uploaded Files</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {filteredClients.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="p-6 text-center text-slate-500 font-semibold">No clients match the search criteria.</td>
                            </tr>
                          ) : (
                            filteredClients.map((client) => (
                              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-bold text-slate-900">{client.name}</td>
                                <td className="p-4 text-slate-600 font-medium">{client.email}</td>
                                <td className="p-4 text-slate-600 font-mono font-semibold">{client.phone}</td>
                                <td className="p-4 text-center text-slate-500 font-bold">
                                  {client.dob ? new Date(client.dob).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4 text-slate-500 font-medium max-w-xs truncate" title={client.address}>
                                  {client.address}
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => handleViewClientDocuments(client)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 hover:border-indigo-250 text-[10px] font-bold text-indigo-700 rounded-lg transition-all cursor-pointer shadow-xs"
                                  >
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    Inspect Files
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AGENTS SECTION (ADMIN ONLY) */}
                  {isAdmin && (
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Operational Agents Directory</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Staff roster with agent privileges. Agents are not permitted to see other agents.</p>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={agentSearch}
                            onChange={(e) => setAgentSearch(e.target.value)}
                            placeholder="Search agent details..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs w-full sm:w-56 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-750">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="p-4">Agent Name</th>
                              <th className="p-4">Email Address</th>
                              <th className="p-4">Phone</th>
                              <th className="p-4 text-center">Date of birth</th>
                              <th className="p-4">Address</th>
                              <th className="p-4 text-center">Registration Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {filteredAgents.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="p-6 text-center text-slate-500 font-semibold">No agents registered on roster.</td>
                              </tr>
                            ) : (
                              filteredAgents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 font-bold text-slate-900">{agent.name}</td>
                                  <td className="p-4 text-slate-600 font-medium">{agent.email}</td>
                                  <td className="p-4 text-slate-600 font-mono font-semibold">
                                    {agent.customerProfile?.phone || '000-000-0000'}
                                  </td>
                                  <td className="p-4 text-center text-slate-500 font-bold">
                                    {agent.customerProfile?.dob ? new Date(agent.customerProfile.dob).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="p-4 text-slate-500 font-medium max-w-xs truncate" title={agent.customerProfile?.address}>
                                    {agent.customerProfile?.address || 'N/A'}
                                  </td>
                                  <td className="p-4 text-center text-slate-500 font-bold">
                                    {new Date(agent.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: POLICIES */}
              {activeTab === 'policies' && (
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col text-left">
                  {/* Filters Header */}
                  <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Active Policies Log ({filteredPolicies.length})</h3>
                    <div className="flex gap-2">
                      {['ALL', 'ACTIVE', 'PENDING', 'CANCELLED'].map((filterVal) => (
                        <button
                          key={filterVal}
                          onClick={() => setPolicyFilter(filterVal)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            policyFilter === filterVal 
                              ? 'bg-slate-900 text-white shadow-xs' 
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                          }`}
                        >
                          {filterVal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Policies Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-750">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Policy Number</th>
                          <th className="p-4">Client Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4 text-right">Premium</th>
                          <th className="p-4 text-center">Period</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-155">
                        {filteredPolicies.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-slate-500 font-semibold">No policies match this filter criteria.</td>
                          </tr>
                        ) : (
                          filteredPolicies.map((policy) => (
                            <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold text-slate-900 font-mono">{policy.policyNumber}</td>
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{policy.customer?.name || 'N/A'}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{policy.customer?.email || ''}</div>
                              </td>
                              <td className="p-4 font-bold text-slate-700">{policy.policyType}</td>
                              <td className="p-4 text-right font-extrabold text-slate-900">${policy.premiumAmount}</td>
                              <td className="p-4 text-center text-slate-550 font-semibold">
                                {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-center">{getStatusBadge(policy.status)}</td>
                              <td className="p-4 text-center">
                                {policy.status === 'PENDING' ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => updatePolicyStatus(policy.id, 'ACTIVE')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => updatePolicyStatus(policy.id, 'CANCELLED')}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold">Closed</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: CLAIMS */}
              {activeTab === 'claims' && (
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col text-left">
                  {/* Filters Header */}
                  <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Claims Audits ({filteredClaims.length})</h3>
                    <div className="flex gap-2">
                      {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((filterVal) => (
                        <button
                          key={filterVal}
                          onClick={() => setClaimFilter(filterVal)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            claimFilter === filterVal 
                              ? 'bg-slate-900 text-white shadow-xs' 
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                          }`}
                        >
                          {filterVal.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Claims Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-750">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Policy Number</th>
                          <th className="p-4">Description / Reason</th>
                          <th className="p-4 text-center">Submission Date</th>
                          <th className="p-4 text-right">Claim Amount</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredClaims.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500 font-semibold">No claims match this filter criteria.</td>
                          </tr>
                        ) : (
                          filteredClaims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold text-slate-900 font-mono">{claim.policy?.policyNumber || 'N/A'}</td>
                              <td className="p-4 max-w-xs font-semibold text-slate-800">{claim.reason}</td>
                              <td className="p-4 text-center text-slate-500 font-bold">
                                {new Date(claim.submissionDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right font-extrabold text-slate-900">${claim.claimAmount}</td>
                              <td className="p-4 text-center">{getStatusBadge(claim.status)}</td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {claim.status !== 'APPROVED' && claim.status !== 'REJECTED' ? (
                                    <>
                                      {claim.status !== 'UNDER_REVIEW' && (
                                        <button
                                          onClick={() => updateClaimStatus(claim.id, 'UNDER_REVIEW')}
                                          className="px-2 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                        >
                                          Audit
                                        </button>
                                      )}
                                      <button
                                        onClick={() => updateClaimStatus(claim.id, 'APPROVED')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => updateClaimStatus(claim.id, 'REJECTED')}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold">Completed</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col text-left space-y-4">
                  {/* Filters Header */}
                  <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Premium Payments Ledger</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Auditing and tracing of premium transaction records.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={paymentSearch}
                          onChange={(e) => setPaymentSearch(e.target.value)}
                          placeholder="Search client or policy..."
                          className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs w-full sm:w-56 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        />
                      </div>

                      {/* Dropdown Filter */}
                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-750 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Health">Health</option>
                        <option value="Auto">Auto</option>
                        <option value="Life">Life</option>
                        <option value="Property">Property</option>
                      </select>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-750">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Client / Subscriber</th>
                          <th className="p-4">Policy details</th>
                          <th className="p-4 text-right">Amount</th>
                          <th className="p-4 text-center">Receipt Date</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500 font-semibold">No payment transactions found matching search options.</td>
                          </tr>
                        ) : (
                          filteredPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono text-[10px] text-slate-500 font-bold select-all">{payment.id}</td>
                              <td className="p-4">
                                <div className="font-bold text-slate-850">{payment.policy?.customer?.name || 'N/A'}</div>
                                <div className="text-[10px] text-slate-550 mt-0.5">{payment.policy?.customer?.email || ''}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{payment.policy?.policyType} Cover</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{payment.policy?.policyNumber || ''}</div>
                              </td>
                              <td className="p-4 text-right font-extrabold text-indigo-700 text-sm">
                                ${payment.amount}
                              </td>
                              <td className="p-4 text-center text-slate-550 font-bold">
                                {new Date(payment.paymentDate).toLocaleDateString()}{' '}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {new Date(payment.paymentDate).toLocaleTimeString()}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                {getStatusBadge(payment.paymentStatus)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: MESSAGES */}
              {activeTab === 'messages' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  {/* Message Composer */}
                  <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Compose Message</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Select Subscriber</label>
                        <select
                          value={selectedCustomerId}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                          <option value="">-- Choose Customer --</option>
                          {policies.map((policy) => (
                            policy.customer ? (
                              <option key={policy.customer.id} value={policy.customer.id}>
                                {policy.customer.name} ({policy.policyNumber})
                              </option>
                            ) : null
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Message Content</label>
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Write support message or audit update here..."
                          rows="4"
                          className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSendMessage}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer text-center"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>

                  {/* Messaging Log */}
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Communication History ({messages.length})</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {messages.length === 0 ? (
                        <p className="text-xs text-slate-550 text-center py-12">No messages registered in system.</p>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="p-4 border border-slate-150 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                              <div>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  message.senderRole === 'CUSTOMER' 
                                    ? 'bg-indigo-50 text-indigo-700' 
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {message.senderRole === 'CUSTOMER' ? 'Customer Message' : 'Operations Reply'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">{new Date(message.createdAt).toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-slate-750 font-semibold leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: AGENT MY PROFILE (AGENT ONLY) */}
              {!isAdmin && activeTab === 'profile' && (
                <div className="space-y-6 text-left max-w-xl">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Update Professional Profile</h3>
                    <p className="text-xs text-slate-500 mt-1">Configure your contact details and registered office details for subscriber reference.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Agent Name"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={profileDob}
                          onChange={(e) => setProfileDob(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Office / Residential Address</label>
                        <textarea
                          required
                          rows="3"
                          value={profileAddress}
                          onChange={(e) => setProfileAddress(e.target.value)}
                          placeholder="Office Suite, Street Address, State, ZIP"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold rounded-xl text-white transition-colors cursor-pointer shadow-sm"
                      >
                        {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL: Client Documents Vault */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 text-left space-y-4 relative shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Document Vault</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Secure upload history for client: <span className="font-bold text-indigo-650">{selectedClient.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedClient(null)} 
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-[11px] text-slate-500 font-semibold">Retrieving secure documents...</p>
                </div>
              ) : clientDocuments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                  No documents have been uploaded by this customer yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {clientDocuments.map((doc) => (
                    <div key={doc.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl shrink-0 font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={doc.fileName}>{doc.fileName}</h4>
                          <p className="text-[9px] text-slate-550 font-semibold mt-0.5">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            const blob = await api.downloadDocument(doc.id);
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = doc.fileName;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            setTimeout(() => {
                              window.URL.revokeObjectURL(url);
                            }, 60000);
                          } catch (err) {
                            setError(err.message || 'Unable to download document.');
                          }
                        }}
                        className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors shadow-xs cursor-pointer text-center"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
