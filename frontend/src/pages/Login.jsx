import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Lock, Smartphone, ShieldCheck, UserCheck, Users, Shield } from 'lucide-react';

const Login = () => {
  const { loginUser } = useApp();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('ADMIN'); // 'ADMIN' or 'MEMBER'
  const [emailOrMobile, setEmailOrMobile] = useState('admin@mandalsetu.com');
  const [password, setPassword] = useState('Password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (type) => {
    setLoginType(type);
    setError('');
    if (type === 'ADMIN') {
      setEmailOrMobile('admin@mandalsetu.com');
      setPassword('Password123');
    } else {
      setEmailOrMobile('member@mandalsetu.com');
      setPassword('Password123');
    }
  };

  const handleQuickFill = (email, pass, type) => {
    setLoginType(type);
    setEmailOrMobile(email);
    setPassword(pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrMobile || !password) {
      setError('सर्व फील्ड भरणे आवश्यक आहे / All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/auth/login', { emailOrMobile, password });
      loginUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'लॉगिन अयशस्वी. कृपया तपशील तपासा / Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl ring-1 ring-black/5">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 shadow-lg text-white font-extrabold text-3xl mb-3">
            म
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            MandalSetu • मंडळसेतू
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            सुरक्षित व परवानग्यांवर आधारित मंडळ व्यवस्थापन
          </p>
        </div>

        {/* Admin vs Member Login Tabs */}
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              loginType === 'ADMIN'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield size={15} />
            <span>प्रशासक लॉगिन (Admin)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('MEMBER')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              loginType === 'MEMBER'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={15} />
            <span>सदस्य लॉगिन (Member)</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              {loginType === 'ADMIN' ? 'प्रशासक ईमेल किंवा मोबाईल / Admin ID' : 'सदस्य ईमेल किंवा मोबाईल / Member ID'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Smartphone size={16} />
              </span>
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="example@gmail.com किंवा 9876543210"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600">
                पासवर्ड / Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:underline">
                विसरलात? / Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-xl shadow-md active:scale-95 duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginType === 'ADMIN'
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            <ShieldCheck size={18} />
            <span>
              {loading
                ? 'लॉगिन करत आहे...'
                : loginType === 'ADMIN'
                ? 'प्रशासक म्हणून लॉगिन करा'
                : 'सदस्य म्हणून लॉगिन करा'}
            </span>
          </button>
        </form>

        {/* Quick Demo Credentials Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 text-center mb-2.5">
            त्वरित चाचणी खाती / Quick Demo Accounts:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@mandalsetu.com', 'Password123', 'ADMIN')}
              className="px-2 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold border border-orange-200 transition text-center"
            >
              प्रशासक (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('treasurer@mandalsetu.com', 'Password123', 'ADMIN')}
              className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition text-center"
            >
              खजिनदार (Treasurer)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('member@mandalsetu.com', 'Password123', 'MEMBER')}
              className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition text-center"
            >
              सदस्य (Member)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          नवीन मंडळ नोंदणी करायची आहे?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            येथे नोंदणी करा / Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

