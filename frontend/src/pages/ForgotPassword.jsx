import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('ईमेल भरणे आवश्यक आहे / Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'पासवर्ड रीसेट लिंक पाठवली गेली आहे / Reset link sent');
    } catch (err) {
      setError(err.response?.data?.message || 'काहीतरी चूक झाली / Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            पासवर्ड विसरलात? / Forgot Password
          </h1>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            तुमचा नोंदणीकृत ईमेल पत्ता प्रविष्ट करा
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              ईमेल आयडी / Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mandal.com"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl shadow-md active:scale-95 duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {loading ? 'प्रक्रिया सुरू आहे...' : 'पासवर्ड रीसेट करा / Reset Password'}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
            <ArrowLeft size={14} />
            <span>लॉगिन पानावर जा / Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
