import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { ShieldAlert, User, Smartphone, Mail, Lock, Building, MapPin } from 'lucide-react';

const Register = () => {
  const { loginUser } = useApp();
  const navigate = useNavigate();

  const [mandalName, setMandalName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mandalName || !adminName || !mobile || !email || !password || !city || !state) {
      setError('सर्व तपशील भरणे बंधनकारक आहे / All fields are required');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('कृपया वैध ईमेल आयडी टाका / Please enter a valid email address');
      return;
    }

    // Mobile number validation (10 digits starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError('कृपया वैध १०-अंकी मोबाईल क्रमांक टाका / Please enter a valid 10-digit mobile number');
      return;
    }

    // Password length validation (at least 6 characters)
    if (password.length < 6) {
      setError('पासवर्ड किमान ६ अक्षरांचा असावा / Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/auth/register', {
        mandalName,
        adminName,
        mobile,
        email,
        password,
        city,
        state,
      });
      loginUser(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा / Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 shadow-md text-white font-extrabold text-2xl mb-3">
            म
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            मंडळ नोंदणी / Mandal Registration
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            MandalSetu ERP सह आपले व्यवस्थापन आधुनिक करा
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide border-b border-slate-100 pb-1">
            १. मंडळाचा तपशील / 1. Mandal Details
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">मंडळाचे नाव / Mandal Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Building size={15} />
                </span>
                <input
                  type="text"
                  value={mandalName}
                  onChange={(e) => setMandalName(e.target.value)}
                  placeholder="उदा. श्री गणेश मित्र मंडळ"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">शहर / City *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin size={15} />
                </span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="उदा. पुणे / मुंबई"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide border-b border-slate-100 pb-1 mt-6">
            २. मुख्य प्रशासक तपशील / 2. Admin User Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">प्रशासकाचे नाव / Admin Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="उदा. राहुल थोरात"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">मोबाईल क्रमांक / Mobile *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Smartphone size={15} />
                </span>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ईमेल आयडी / Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mandal.com"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">पासवर्ड / Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl shadow-md active:scale-95 duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 text-sm"
          >
            <span>
              {loading ? 'नोंदणी होत आहे...' : 'मंडळ नोंदणी करा / Register Mandal'}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          आधीच नोंदणी केली आहे? / Already Registered?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            लॉगिन करा / Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
