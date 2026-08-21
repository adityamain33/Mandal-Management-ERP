import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Lock, Smartphone, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { loginUser } = useApp();
  const navigate = useNavigate();

  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 shadow-md text-white font-extrabold text-2xl mb-3 animate-pulse">
            म
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            MandalSetu • मंडळसेतू
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            गणेश मंडळ व्यवस्थापनाचा स्मार्ट सेतू
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              ईमेल किंवा मोबाईल क्रमांक / Email or Mobile
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Smartphone size={16} />
              </span>
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="example@gmail.com / 9876543210"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">
                पासवर्ड / Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:underline">
                विसरलात? / Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl shadow-md active:scale-95 duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={18} />
            <span>
              {loading ? 'लॉगिन करत आहे...' : 'लॉगिन करा / Login'}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          नवीन मंडळ आहे? / New Organization?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            नोंदणी करा / Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
