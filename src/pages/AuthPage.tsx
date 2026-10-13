import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] dark:bg-[#090D14] font-sans text-black dark:text-white p-4 relative">
      {/* Brand Header Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
          S
        </div>
        <span className="text-base font-bold text-black dark:text-white tracking-tight">
          SYMBIO Intelligence
        </span>
      </Link>

      <div className="w-full max-w-sm bg-white dark:bg-[#131926] p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#222C3F] shadow-sm space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">
            {isLogin ? 'Sign In to Portal' : 'Register Facility Account'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {isLogin 
              ? 'Enter facility credentials to access ESG telematics & ledger' 
              : 'Join the verified Industrial Symbiosis & Material Network'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-md text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
              Facility Work Email
            </label>
            <input 
              type="email" 
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D14] border border-[#E2E8F0] dark:border-[#222C3F] rounded-md focus:outline-none focus:border-[#2563EB] text-xs text-black dark:text-white placeholder-[#94A3B8] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="esg@apex-metallurgy.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
              Security Key / Password
            </label>
            <input 
              type="password" 
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D14] border border-[#E2E8F0] dark:border-[#222C3F] rounded-md focus:outline-none focus:border-[#2563EB] text-xs text-black dark:text-white placeholder-[#94A3B8] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Verifying...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative py-1 flex items-center justify-center">
          <div className="border-t border-[#E2E8F0] dark:border-[#222C3F] w-full"></div>
          <span className="bg-white dark:bg-[#131926] px-2 text-[10px] uppercase font-semibold text-[#94A3B8] absolute">
            or instant sandbox
          </span>
        </div>

        {/* Demo Fast Access Button */}
        <button
          onClick={() => {
            loginAsDemo();
            navigate('/dashboard');
          }}
          className="w-full py-2 bg-slate-50 dark:bg-[#182030] hover:bg-slate-100 dark:hover:bg-[#222C3F] text-black dark:text-white border border-[#E2E8F0] dark:border-[#222C3F] rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Launch Demo Sandbox</span>
        </button>

        <div className="text-center pt-1">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-xs text-[#2563EB] dark:text-[#60A5FA] hover:underline font-medium"
          >
            {isLogin ? "Need a facility account? Register here" : "Already registered? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
