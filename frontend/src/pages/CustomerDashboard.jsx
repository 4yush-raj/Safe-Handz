import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  Shield, LogOut, CheckCircle, FileText, Upload, Plus, Download,
  CreditCard, AlertCircle, MessageCircle, User
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policies');
  const displayName = user?.name || 'Customer';
  
  // Data States
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Modals / Form States
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [policyRequestModalOpen, setPolicyRequestModalOpen] = useState(false);
  
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Form Inputs
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [requestType, setRequestType] = useState('Health');
  const [requestStartDate, setRequestStartDate] = useState('');
  const [requestEndDate, setRequestEndDate] = useState('');
  
  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Global feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all user-related data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [policiesData, claimsData, paymentsData, documentsData, messagesData, profileData] = await Promise.all([
        api.getPolicies(),
        api.getClaims(),
        api.getPayments(),
        api.getDocuments(),
        api.getMessages(),
        api.getProfile().catch(() => ({})),
      ]);
      setPolicies(policiesData);
      setClaims(claimsData);
      setPayments(paymentsData);
      setDocuments(documentsData);
      setMessages(messagesData);
      if (profileData) {
        setProfileName(profileData.name || '');
        setProfilePhone(profileData.phone || '');
        setProfileDob(profileData.dob ? profileData.dob.split('T')[0] : '');
        setProfileAddress(profileData.address || '');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
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
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Submit a claim
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!selectedPolicy) return;
    
    try {
      const res = await api.submitClaim(selectedPolicy.id, claimAmount, claimReason);
      setSuccess('Claim submitted successfully!');
      setClaimModalOpen(false);
      setClaimAmount('');
      setClaimReason('');
      fetchData(); // reload dashboard
    } catch (err) {
      setError(err.message || 'Failed to submit claim.');
    }
  };

  // Record a payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!selectedPolicy) return;

    try {
      const res = await api.recordPayment(selectedPolicy.id, payAmount);
      setSuccess('Payment recorded successfully!');
      setPaymentModalOpen(false);
      setPayAmount('');
      fetchData(); // reload
    } catch (err) {
      setError(err.message || 'Failed to process payment.');
    }
  };

  // Upload Document
  const handleDocUpload = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await api.uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      setDocModalOpen(false);
      setUploadFile(null);
      fetchData(); // reload
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!messageText.trim()) return;

    try {
      await api.sendMessage(messageText.trim());
      setSuccess('Message sent to the support team.');
      setMessageText('');
      setMessageModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    }
  };

  const handleRequestPolicy = async (e) => {
    e.preventDefault();
    clearFeedback();

    try {
      await api.requestPolicy({
        policyType: requestType,
        startDate: requestStartDate,
        endDate: requestEndDate,
      });
      setSuccess('Policy request submitted. An agent will review it soon.');
      setPolicyRequestModalOpen(false);
      setRequestType('Health');
      setRequestStartDate('');
      setRequestEndDate('');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to send policy request.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">Approved/Active</span>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">Pending Review</span>;
      case 'REJECTED':
      case 'FAILED':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-full">Rejected/Failed</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-550/20 rounded-xl">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white leading-tight">Safe Handz</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">Customer Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-200 font-bold border border-slate-700 uppercase">
              {displayName[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white">{displayName}</p>
              <p className="text-[10px] text-slate-400">{user?.email || 'Signed in'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/insurance-dashboard?role=${(user?.role || 'CUSTOMER')}`)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-600 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer"
              title="Open Operations Dashboard"
            >
              Dashboard
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Navigation */}
        <section className="md:col-span-1 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
            <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold px-2 mb-2">Navigation</p>
            <button
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-350 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              My Policies
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'claims' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-350 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Claims History
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-350 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Payments
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-350 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Documents
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-350 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-350 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              My Profile
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-md">
            <h3 className="text-xs font-bold text-indigo-400">Need Assistance?</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Our support staff is ready to help you process claims 24/7.</p>
            <a href="mailto:support@safehandz.com" className="inline-block mt-3 px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-200 transition-colors border border-slate-800 shadow-xs">
              Email Support
            </a>
          </div>
        </section>

        {/* Contents Area */}
        <section className="md:col-span-3">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex justify-between items-center shadow-xs">
              <span>{error}</span>
              <button onClick={clearFeedback} className="text-red-500 hover:text-red-850 cursor-pointer font-bold">Close</button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-700 text-xs font-semibold flex justify-between items-center shadow-xs">
              <span>{success}</span>
              <button onClick={clearFeedback} className="text-emerald-500 hover:text-emerald-850 cursor-pointer font-bold">Close</button>
            </div>
          )}

          {/* Loader */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Tab 1: Policies */}
          {!loading && activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Active Insurance Policies</h2>
                <button 
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-semibold rounded-lg text-slate-700 transition-colors cursor-pointer shadow-xs"
                >
                  Refresh
                </button>
              </div>

              {policies.length === 0 ? (
                <div className="glass-card bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No policies found</h3>
                  <p className="text-xs text-slate-500 mt-1">You don't currently have any insurance policies. Request a new policy to get coverage started.</p>
                  <button
                    onClick={() => setPolicyRequestModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Request New Policy
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      onClick={() => setPolicyRequestModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Request New Policy
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policies.map(policy => (
                    <div key={policy.id} className="glass-card bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-slate-50 text-slate-550 border border-slate-150 px-2 py-0.5 rounded-md font-semibold font-mono">
                            {policy.policyNumber}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-2">{policy.policyType}</h3>
                        </div>
                        {getStatusBadge(policy.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 py-3 my-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Premium Amount</p>
                          <p className="font-extrabold text-slate-900 mt-0.5">${policy.premiumAmount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Ends On</p>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {new Date(policy.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setClaimModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          File Claim
                        </button>
                        
                        <button
                          type="button"
                          disabled={policy.status !== 'ACTIVE'}
                          onClick={async () => {
                            if (policy.status !== 'ACTIVE') {
                              setError('Certificate downloads are available only for active policies.');
                              return;
                            }

                            try {
                              const blob = await api.downloadPolicyCertificate(policy.id);
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `Policy_Certificate_${policy.policyNumber}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              setTimeout(() => {
                                window.URL.revokeObjectURL(url);
                              }, 60000);
                            } catch (err) {
                              setError(err.message || 'Unable to download certificate.');
                            }
                          }}
                          className={`flex items-center justify-center px-3 py-2 rounded-xl transition-colors ${policy.status === 'ACTIVE' ? 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-705 cursor-pointer shadow-xs' : 'bg-slate-50/50 border border-slate-200 text-slate-400 cursor-not-allowed'}`}
                          title={policy.status === 'ACTIVE' ? 'Download Certificate' : 'Download available after approval'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Messages */}
          {!loading && activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Messages with Support</h2>
                  <p className="text-xs text-slate-500 mt-1">Chat with your agent and review support replies.</p>
                </div>
                <button 
                  onClick={() => setMessageModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-slate-100 transition-colors cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
              </div>

              {messages.length === 0 ? (
                <div className="glass-card bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No messages yet</h3>
                  <p className="text-xs text-slate-500 mt-1">Start a conversation with your agent for faster support.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(message => (
                    <div key={message.id} className="glass-card bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex justify-between gap-3 items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{message.senderRole === 'CUSTOMER' ? 'Your message' : 'Agent reply'}</p>
                          <p className="mt-2 text-sm text-slate-800">{message.content}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 text-right">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Claims */}
          {!loading && activeTab === 'claims' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Your Insurance Claims</h2>
                <button 
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-semibold rounded-lg text-slate-700 transition-colors cursor-pointer shadow-xs"
                >
                  Refresh
                </button>
              </div>

              {claims.length === 0 ? (
                <div className="glass-card bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No claims submitted</h3>
                  <p className="text-xs text-slate-500 mt-1">When you submit claims for your active policies, they will appear here.</p>
                </div>
              ) : (
                <div className="glass-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-750">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Policy No</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4">Submission Date</th>
                          <th className="p-4 text-right">Amount</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {claims.map(claim => (
                          <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">
                              {claim.policy?.policyNumber || 'N/A'}
                            </td>
                            <td className="p-4 max-w-xs truncate text-slate-750 font-medium">{claim.reason}</td>
                            <td className="p-4 text-slate-500">
                              {new Date(claim.submissionDate).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right font-extrabold text-slate-900">${claim.claimAmount}</td>
                            <td className="p-4 text-center">{getStatusBadge(claim.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Payments */}
          {!loading && activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Premium Payments</h2>
                <div className="flex gap-2">
                  {policies.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedPolicy(policies[0]);
                        setPaymentModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Make Payment
                    </button>
                  )}
                  <button 
                    onClick={fetchData}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-semibold rounded-lg text-slate-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="glass-card bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No payment records</h3>
                  <p className="text-xs text-slate-500 mt-1">Make a premium payment to keep your coverage active. Payment history will be listed here.</p>
                </div>
              ) : (
                <div className="glass-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-750">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Policy No</th>
                          <th className="p-4">Payment Date</th>
                          <th className="p-4 text-right">Amount</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map(payment => (
                          <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-slate-500 font-mono text-[10px]">{payment.id}</td>
                            <td className="p-4 font-bold text-slate-900">{payment.policy?.policyNumber || 'N/A'}</td>
                            <td className="p-4 text-slate-550">
                              {new Date(payment.paymentDate).toLocaleDateString()}{' '}
                              {new Date(payment.paymentDate).toLocaleTimeString()}
                            </td>
                            <td className="p-4 text-right font-extrabold text-slate-900">${payment.amount}</td>
                            <td className="p-4 text-center">{getStatusBadge(payment.paymentStatus)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Documents */}
          {!loading && activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Identity & Policy Documents</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDocModalOpen(true)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <button 
                    onClick={fetchData}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] font-semibold rounded-lg text-slate-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="glass-card bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No documents uploaded</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload identity proof or address documents to verify your profile claims.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="glass-card bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/25 rounded-xl text-indigo-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{doc.fileName}</h4>
                          <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">
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
                        className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: My Profile */}
          {!loading && activeTab === 'profile' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  My Personal Profile
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage your identity details, phone number, and physical address here.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="glass-card bg-white rounded-3xl p-6 border border-slate-200 space-y-4 max-w-xl shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Residential Address</label>
                    <textarea
                      required
                      rows="3"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="123 Main St, Apt 4B, Springfield, OR 97477"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer shadow-sm"
                  >
                    {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </section>
      </main>

      {/* MODAL: File Claim */}
      {claimModalOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-left space-y-4 relative shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">File Insurance Claim</h3>
            <p className="text-xs text-slate-550 font-medium">
              Filing a new claim on policy: <span className="font-bold text-indigo-650">{selectedPolicy.policyNumber}</span> ({selectedPolicy.policyType})
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Claim Amount ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-800 placeholder-slate-400 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason / Description</label>
                <textarea
                  required
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="Describe the medical emergency or claim reasoning..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-800 placeholder-slate-400 resize-none shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-650 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Make Premium Payment */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-left space-y-4 relative shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Record Premium Payment</h3>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Policy</label>
                <select
                  value={selectedPolicy?.id || ''}
                  onChange={(e) => setSelectedPolicy(policies.find(p => p.id === e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none text-slate-800 shadow-xs"
                >
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} ({p.policyType}) - Due Premium
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Amount ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-800 placeholder-slate-400 shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-650 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Document */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-left space-y-4 relative shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Upload Documents</h3>
            <p className="text-xs text-slate-500 font-medium">Select identity proofs or address policy documents to save under your profile.</p>

            <form onSubmit={handleDocUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Attachment</label>
                <div className="border border-dashed border-slate-250 hover:border-indigo-550/50 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50/50">
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-750 font-bold">
                    {uploadFile ? uploadFile.name : 'Click to select file'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">PDF, JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-650 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  Start Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Send Message */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-left space-y-4 relative shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Send a Message</h3>
            <p className="text-xs text-slate-500 font-medium">Write to your agent or support team and receive a reply here.</p>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <textarea
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Describe your request or ask your agent a question..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none transition-colors text-slate-850 placeholder-slate-400 resize-none shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-650 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Policy Request */}
      {policyRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-left space-y-4 relative shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Request a New Policy</h3>
            <p className="text-xs text-slate-500 font-medium">Provide details for the policy you want and an agent will review it.</p>

            <form onSubmit={handleRequestPolicy} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Policy Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none text-slate-800 shadow-xs"
                >
                  <option value="Health">Health</option>
                  <option value="Auto">Auto</option>
                  <option value="Home">Home</option>
                  <option value="Travel">Travel</option>
                  <option value="Business">Business</option>
                  <option value="Life">Life</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={requestStartDate}
                    onChange={(e) => setRequestStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none text-slate-800 shadow-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    required
                    value={requestEndDate}
                    onChange={(e) => setRequestEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none text-slate-800 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPolicyRequestModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-650 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
