import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Settings as SettingsIcon, CheckCircle, Save, Building, FileText, Lock, X } from 'lucide-react';

const Settings = () => {
  const { role, activeMandalName, refetchUser } = useApp();

  const [receiptPrefix, setReceiptPrefix] = useState('');
  const [receiptStartNumber, setReceiptStartNumber] = useState(1);
  const [expensePrefix, setExpensePrefix] = useState('');
  const [expenseStartNumber, setExpenseStartNumber] = useState(1);
  const [mandalLogo, setMandalLogo] = useState('');
  const [authorizedSignature, setAuthorizedSignature] = useState('');

  // Mandal profile fields
  const [mandalName, setMandalName] = useState('');
  const [regDetails, setRegDetails] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 250 * 1024) {
      alert('कृपया २५०KB पेक्षा लहान इमेज निवडा. (Please choose an image smaller than 250KB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const fetchSettingsAndMandal = async () => {
    try {
      setLoading(true);
      const [settingsRes, profileRes] = await [
        await axios.get('/settings'),
        await axios.get('/auth/profile'),
      ];

      const s = settingsRes.data;
      setReceiptPrefix(s.receiptPrefix || 'GM/26');
      setReceiptStartNumber(s.receiptStartNumber || 1);
      setExpensePrefix(s.expensePrefix || 'EXP/26');
      setExpenseStartNumber(s.expenseStartNumber || 1);
      setMandalLogo(s.mandalLogo || '');
      setAuthorizedSignature(s.authorizedSignature || '');

      // Mandal profile
      const userProfile = profileRes.data;
      const mandal = userProfile.mandalRoles[0]?.mandalId;
      if (mandal) {
        setMandalName(mandal.name || '');
        setRegDetails(mandal.registrationDetails || '');
        setAddress(mandal.address || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndMandal();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'MANDAL_ADMIN') {
      setError('क्षमस्व, केवळ मंडळ प्रशासक हे सेटिंग्ज बदलू शकतात. (Mandal Admin role required)');
      return;
    }

    setSuccess(false);
    setError('');

    try {
      // 1. Save settings including logo and signature
      await axios.put('/settings', {
        receiptPrefix,
        receiptStartNumber,
        expensePrefix,
        expenseStartNumber,
        mandalLogo,
        authorizedSignature,
      });

      // 2. Save Mandal profile details in database
      await axios.put('/auth/mandal', {
        name: mandalName,
        registrationDetails: regDetails,
        address,
      });

      setSuccess(true);
      refetchUser();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'सेटिंग्ज जतन करताना त्रुटी आली. (Error saving settings)');
    }
  };

  if (loading) {
    return <div className="card-theme py-8 text-center text-xs text-slate-400 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <SettingsIcon size={20} />
            </div>
            <span>सेटिंग्ज / System Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            पावतीचे आकडे, मंडळाचा प्रोफाइल पत्ता आणि प्रणाली सेटिंग्ज
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-xs font-bold text-green-700 flex items-center gap-2.5 shadow-sm animate-fadeIn">
            <CheckCircle size={16} className="text-green-600" />
            <span>सेटिंग्ज यशस्वीरित्या जतन केल्या! (Settings saved successfully!)</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700 shadow-sm animate-fadeIn">
            {error}
          </div>
        )}

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Profile & Uploads */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Mandal Profile */}
            <div className="card-theme bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
              <h3 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="p-1 bg-orange-50 text-orange-600 rounded-md">
                  <Building size={14} />
                </div>
                <span>मंडळ प्रोफाइल / Mandal Profile</span>
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">मंडळाचे नाव / Mandal Name *</label>
                  <input
                    type="text"
                    required
                    value={mandalName}
                    onChange={(e) => setMandalName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">नोंदणी तपशील / Reg Details</label>
                  <input
                    type="text"
                    value={regDetails}
                    onChange={(e) => setRegDetails(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all duration-150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">पत्ता / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all duration-150"
                />
              </div>
            </div>

            {/* Section: Logo and Signature */}
            <div className="card-theme bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
              <h3 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                  <Building size={14} />
                </div>
                <span>लोगो आणि स्वाक्षरी / Logo & Signature Settings</span>
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Mandal Logo Upload */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">मंडळाचा लोगो / Mandal Logo (PNG/JPG)</label>
                  <div className="flex flex-col gap-3">
                    {mandalLogo ? (
                      <div className="relative h-24 w-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2 group shadow-inner">
                        <img src={mandalLogo} alt="Mandal Logo" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setMandalLogo('')}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg transition-all shadow-sm cursor-pointer"
                          title="Remove Logo"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 text-[10px] font-semibold p-2 leading-tight text-center">
                        लोगो नाही<br />(No Logo)
                      </div>
                    )}
                    <label className="relative cursor-pointer self-start">
                      <span className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] px-3 py-2 rounded-xl transition-colors border border-orange-100 shadow-sm">
                        Choose Logo Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setMandalLogo)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal font-medium">
                    * पावतीवर डाव्या कोपऱ्यात छापण्यासाठी चौरस आकाराचा लोगो निवडा (कमाल २५०KB).
                  </p>
                </div>

                {/* Authorized Signature Upload */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">अधिकृत स्वाक्षरी / Authorized Signature</label>
                  <div className="flex flex-col gap-3">
                    {authorizedSignature ? (
                      <div className="relative h-24 w-44 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2 group shadow-inner">
                        <img src={authorizedSignature} alt="Authorized Signature" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setAuthorizedSignature('')}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg transition-all shadow-sm cursor-pointer"
                          title="Remove Signature"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-44 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 text-[10px] font-semibold p-2 leading-tight text-center">
                        स्वाक्षरी नाही<br />(No Signature)
                      </div>
                    )}
                    <label className="relative cursor-pointer self-start">
                      <span className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] px-3 py-2 rounded-xl transition-colors border border-orange-100 shadow-sm">
                        Choose Signature Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setAuthorizedSignature)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal font-medium">
                    * पावतीवर उजव्या कोपऱ्यात छापण्यासाठी पांढऱ्या/पारदर्शक बॅकग्राउंडची स्वाक्षरी निवडा (कमाल २५०KB).
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Book configuration & live preview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section 2: Book Series Prefix */}
            <div className="card-theme bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
              <h3 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                  <FileText size={14} />
                </div>
                <span>पावती आणि खर्च पुस्तके / Books Setup</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">पावती प्रीफिक्स *</label>
                    <input
                      type="text"
                      required
                      value={receiptPrefix}
                      onChange={(e) => setReceiptPrefix(e.target.value)}
                      placeholder="e.g. GM/26"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Receipt No *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiptStartNumber}
                      onChange={(e) => setReceiptStartNumber(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">खर्च प्रीफिक्स *</label>
                    <input
                      type="text"
                      required
                      value={expensePrefix}
                      onChange={(e) => setExpensePrefix(e.target.value)}
                      placeholder="e.g. EXP/26"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Expense No *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={expenseStartNumber}
                      onChange={(e) => setExpenseStartNumber(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE MOCK RECEIPT PREVIEW (WOW factor!) */}
            <div className="card-theme bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Format Preview (थेट नमुना)
              </h4>

              <div className="space-y-3 font-mono text-[11px] leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/40">
                <div className="flex justify-between items-center text-[9px] text-slate-500 border-b border-dashed border-slate-800 pb-2">
                  <span>MandalSetu ERP Engine</span>
                  <span>A5 Landscape</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mandal:</span>
                    <span className="text-orange-400 font-bold">{mandalName || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sample Receipt:</span>
                    <span className="text-indigo-400 font-bold text-right truncate max-w-[200px]">
                      {receiptPrefix || 'GM/26'}/{String(receiptStartNumber || 1).padStart(5, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sample Expense:</span>
                    <span className="text-rose-400 font-bold text-right truncate max-w-[200px]">
                      {expensePrefix || 'EXP/26'}/{String(expenseStartNumber || 1).padStart(5, '0')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-2 text-[9px] text-slate-600 italic">
                  * This will be the layout structure printed on the official PDF.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {role === 'MANDAL_ADMIN' && (
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/10 active:scale-[0.98] duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Save size={16} />
                <span>सेटिंग्ज जतन करा / Save Configuration</span>
              </button>
            )}

          </div>

        </div>
      </form>
      
    </div>
  );
};

export default Settings;
