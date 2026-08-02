import React, { useState } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Auth = () => {
  const { portalRole } = useParams();
  const navigate = useNavigate();
  const { user, login, register, logout } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Validate route parameter
  const validRoles = ['client', 'agent', 'admin'];
  if (!portalRole || !validRoles.includes(portalRole.toLowerCase())) {
    return <Navigate to="/login/client" replace />;
  }

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const roleLower = portalRole.toLowerCase();

  // Role-specific settings
  const config = {
    client: {
      targetRole: 'CUSTOMER',
      title: 'Client Portal',
      subtitle: 'Manage claims & premium payments',
      accentColor: 'indigo',
      glowTop: 'bg-indigo-500/10',
      glowBottom: 'bg-blue-500/5',
      submitBtn: 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 shadow-md shadow-indigo-600/10 focus:border-indigo-500/70',
      textAccent: 'text-indigo-600',
      borderAccent: 'border-indigo-500',
      quickFill: {
        label: 'Fill Customer',
        email: 'testcustomer@example.com',
        password: 'Password123'
      }
    },
    agent: {
      targetRole: 'AGENT',
      title: 'Agent Portal',
      subtitle: 'Review policies & support customers',
      accentColor: 'purple',
      glowTop: 'bg-purple-500/10',
      glowBottom: 'bg-pink-500/5',
      submitBtn: 'bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700/50 shadow-md shadow-purple-600/10 focus:border-purple-500/70',
      textAccent: 'text-purple-600',
      borderAccent: 'border-purple-500',
      quickFill: {
        label: 'Fill Agent',
        email: 'yash@gmail.com',
        password: 'Password123'
      }
    },
    admin: {
      targetRole: 'ADMIN',
      title: 'Admin Portal',
      subtitle: 'System configuration & global audits',
      accentColor: 'rose',
      glowTop: 'bg-rose-500/10',
      glowBottom: 'bg-red-500/5',
      submitBtn: 'bg-rose-600 hover:bg-rose-500 disabled:bg-rose-700/50 shadow-md shadow-rose-600/10 focus:border-rose-500/70',
      textAccent: 'text-rose-600',
      borderAccent: 'border-rose-500',
      quickFill: {
        label: 'Fill Admin',
        email: 'ayush@gmail.com',
        password: 'Password123'
      }
    }
  }[roleLower];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const loggedInUser = await login(email, password);
        
        // Enforce role check for the specific portal
        if (loggedInUser.role !== config.targetRole) {
          logout(); // Terminate the invalid session immediately
          const userFriendlyRole = 
            loggedInUser.role === 'CUSTOMER' ? 'Client' : 
            loggedInUser.role === 'AGENT' ? 'Agent' : 'Admin';
          throw new Error(`Access denied. Your account is registered as an ${userFriendlyRole} and cannot access the ${config.title}.`);
        }
        
        // Store portal selection in localStorage so they redirect back to the correct portal on logout
        localStorage.setItem('lastPortal', roleLower);

        navigate('/dashboard');
      } else {
        await register(name, email, password, config.targetRole);
        setSuccess('Account created successfully! Please log in.');
        setIsLogin(true);
        // Clear inputs
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100/50 text-slate-800 p-4 relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className={`absolute top-1/4 left-1/4 w-72 h-72 ${config.glowTop} rounded-full blur-3xl pointer-events-none`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 ${config.glowBottom} rounded-full blur-3xl pointer-events-none`}></div>

      <div className="w-full max-w-md z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Unified Card Header: Deep Navy/Slate Gradient */}
        <div className="bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-8 text-center relative overflow-hidden border-b border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="inline-flex p-3 bg-white/10 border border-white/15 rounded-2xl mb-3 shadow-inner">
            <Shield className={`w-8 h-8 text-indigo-400`} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Safe Handz
          </h1>
          <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase mt-1">{config.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{config.subtitle}</p>
        </div>

        {/* Card Body Panel */}
        <div className="p-8">
          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                isLogin ? `${config.textAccent} border-b-2 ${config.borderAccent}` : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                !isLogin ? `${config.textAccent} border-b-2 ${config.borderAccent}` : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500/70 focus:outline-none transition-colors duration-200 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98] mt-6 ${config.submitBtn}`}
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
          {isLogin && config.quickFill && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">Quick Fill Demo Account</p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setEmail(config.quickFill.email);
                    setPassword(config.quickFill.password);
                  }}
                  className="px-6 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
                >
                  {config.quickFill.label}
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
