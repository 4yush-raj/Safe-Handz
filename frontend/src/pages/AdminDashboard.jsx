import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Shield, LogOut, FileText, AlertCircle, CreditCard, Users, CheckCircle2, XCircle, Clock3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMap, setStatusMap] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [policiesData, claimsData, paymentsData, messagesData] = await Promise.all([
        api.getPolicies(),
        api.getClaims(),
        api.getPayments(),
        api.getMessages(),
      ]);
      setPolicies(policiesData || []);
      setClaims(claimsData || []);
      setPayments(paymentsData || []);
      setMessages(messagesData || []);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => ({
    policies: policies.length,
    claims: claims.length,
    payments: payments.length,
  }), [policies, claims, payments]);

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
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to send message.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-xl font-semibold">Safe Handz</p>
            <p className="text-xs text-slate-400">Operations dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400">{user?.email || 'Signed in'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/insurance-dashboard?role=${(user?.role || 'ADMIN')}`)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-600 text-xs font-semibold rounded-lg text-white transition-colors"
              title="Open Operations Dashboard"
            >
              Dashboard
            </button>
            <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        {error ? (
          <div className="rounded-xl border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-900 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-slate-400"><FileText className="w-4 h-4" /> Policies</div>
            <p className="mt-3 text-3xl font-semibold">{summary.policies}</p>
          </div>
          <div className="rounded-2xl border border-slate-900 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-slate-400"><AlertCircle className="w-4 h-4" /> Claims</div>
            <p className="mt-3 text-3xl font-semibold">{summary.claims}</p>
          </div>
          <div className="rounded-2xl border border-slate-900 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-slate-400"><CreditCard className="w-4 h-4" /> Payments</div>
            <p className="mt-3 text-3xl font-semibold">{summary.payments}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-900 bg-slate-900/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Policies</h2>
              <span className="rounded-full border border-slate-800 px-2.5 py-1 text-xs text-slate-400">{policies.length} total</span>
            </div>
            <div className="space-y-3">
              {policies.length === 0 ? <EmptyState label="No policies are available yet." /> : policies.map((policy) => (
                <div key={policy.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{policy.policyType}</p>
                      <p className="text-sm text-slate-400">{policy.policyNumber}</p>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">{policy.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                    <span>Premium: ${policy.premiumAmount}</span>
                    <span>Customer: {policy.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {policy.status === 'PENDING' ? (
                      <>
                        <button onClick={() => updatePolicyStatus(policy.id, 'ACTIVE')} className="rounded-lg border border-emerald-700/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300">Approve</button>
                        <button onClick={() => updatePolicyStatus(policy.id, 'CANCELLED')} className="rounded-lg border border-red-700/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300">Reject</button>
                      </>
                    ) : (
                      <button disabled className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-400">No actions available</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-slate-900/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Claims</h2>
              <span className="rounded-full border border-slate-800 px-2.5 py-1 text-xs text-slate-400">{claims.length} total</span>
            </div>
            <div className="space-y-3">
              {claims.length === 0 ? <EmptyState label="No claims submitted yet." /> : claims.map((claim) => (
                <div key={claim.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{claim.reason}</p>
                      <p className="text-sm text-slate-400">{claim.policy?.policyNumber || 'Policy unavailable'}</p>
                    </div>
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">{claim.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span>Amount: ${claim.claimAmount}</span>
                    <span>{new Date(claim.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => updateClaimStatus(claim.id, 'UNDER_REVIEW')} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300">Under Review</button>
                    <button onClick={() => updateClaimStatus(claim.id, 'APPROVED')} className="rounded-lg border border-emerald-700/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300">Approve</button>
                    <button onClick={() => updateClaimStatus(claim.id, 'REJECTED')} className="rounded-lg border border-red-700/40 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-slate-900/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Customer Messaging</h2>
              <span className="rounded-full border border-slate-800 px-2.5 py-1 text-xs text-slate-400">{messages.length} total</span>
            </div>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select customer</option>
                {policies.map((policy) => (
                  policy.customer ? (
                    <option key={policy.customer.id} value={policy.customer.id}>
                      {policy.customer.name} ({policy.policyNumber})
                    </option>
                  ) : null
                ))}
              </select>
              <button onClick={handleSendMessage} className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                Send Message
              </button>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write a message to the selected customer..."
              className="w-full min-h-[120px] rounded-3xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <div className="space-y-3 mt-4">
              {messages.length === 0 ? (
                <EmptyState label="No customer messages yet." />
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{message.senderRole === 'CUSTOMER' ? 'Customer' : 'Agent/Admin'}</p>
                        <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="text-xs text-slate-400">CID: {message.customerId}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-100">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const EmptyState = ({ label }) => (
  <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500">
    <Clock3 className="w-4 h-4" /> {label}
  </div>
);

export default AdminDashboard;
