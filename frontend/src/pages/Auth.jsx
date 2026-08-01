import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(name, email, password, role);
        setSuccess('Account created successfully! Please log in.');
        setIsLogin(true);
        // Clear fields
        setName('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black text-slate-100 p-4">
      {/* Background blobs for premium depth */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-3 shadow-lg shadow-indigo-500/10">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Safe Handz
          </h1>
          <p className="text-sm text-slate-400 mt-1">Modern Insurance Claim & Premium Hub</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Form Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 ${
                isLogin ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 ${
                !isLogin ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-xs font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-200 text-xs font-medium">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account Type</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-100 appearance-none cursor-pointer"
                  >
                    <option value="CUSTOMER">Customer Profile</option>
                    <option value="AGENT">Insurance Agent</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.98] mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox Login Section */}
          {isLogin && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center mb-3">Quick Fill Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEmail('testcustomer@example.com');
                    setPassword('Password123');
                  }}
                  className="px-3 py-1.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Fill Customer
                </button>
                <button
                  onClick={() => {
                    setEmail('testadmin@example.com');
                    setPassword('Password123');
                  }}
                  className="px-3 py-1.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Fill Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
