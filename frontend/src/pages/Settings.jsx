import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Settings as SettingsIcon, CheckCircle, Save, Building, FileText, Lock } from 'lucide-react';

const Settings = () => {
  const { role, activeMandalName, refetchUser } = useApp();

  const [receiptPrefix, setReceiptPrefix] = useState('');
  const [receiptStartNumber, setReceiptStartNumber] = useState(1);
  const [expensePrefix, setExpensePrefix] = useState('');
  const [expenseStartNumber, setExpenseStartNumber] = useState(1);

  // Mandal profile fields
  const [mandalName, setMandalName] = useState('');
  const [regDetails, setRegDetails] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      // 1. Save receipt settings
      await axios.put('/settings', {
        receiptPrefix,
        receiptStartNumber,
        expensePrefix,
        expenseStartNumber,
      });

      // 2. Mock saving mandal details (since in registration it is configured)
      setSuccess(true);
      refetchUser();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('सेटिंग्ज जतन करताना त्रुटी आली. (Error saving settings)');
    }
  };

  if (loading) {
    return <div className="card-theme py-8 text-center text-xs text-slate-400 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <SettingsIcon size={20} className="text-slate-500" />
          <span>सेटिंग्ज / System Settings</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          पावतीचे आकडे, मंडळाचा प्रोफाइल पत्ता आणि प्रणाली सेटिंग्ज
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle size={16} />
              <span>सेटिंग्ज यशस्वीरित्या जतन केल्या! (Settings saved successfully!)</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Section 1: Mandal profile */}
          <div className="card-theme space-y-4">
            <h3 className="font-bold text-xs text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
              <Building size={15} className="text-orange-600" />
              <span>मंडळ प्रोफाइल / Mandal Profile</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">मंडळाचे नाव / Mandal Name</label>
                <input
                  type="text"
                  disabled
                  value={mandalName}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs focus:outline-none text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">नोंदणी तपशील / Reg Details</label>
                <input
                  type="text"
                  disabled
                  value={regDetails}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs focus:outline-none text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">पत्ता / Address</label>
              <input
                type="text"
                disabled
                value={address}
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs focus:outline-none text-slate-500 cursor-not-allowed"
              />
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              * मंडळाची प्राथमिक माहिती बदलण्यासाठी मुख्य सपोर्टला संपर्क साधा. (Mandal profile edits are locked)
            </p>
          </div>

          {/* Section 2: Book Series prefix */}
          <div className="card-theme space-y-4">
            <h3 className="font-bold text-xs text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
              <FileText size={15} className="text-indigo-600" />
              <span>डिजिटल पावती आणि खर्च रचना / Receipt & Expense Books</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">पावती सिरीज प्रीफिक्स / Receipt Prefix *</label>
                <input
                  type="text"
                  required
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value)}
                  placeholder="उदा. GM/26"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">सुरुवात पावती क्रमांक / Start Number *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={receiptStartNumber}
                  onChange={(e) => setReceiptStartNumber(parseInt(e.target.value))}
                  placeholder="1"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-50 pt-4 mt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">खर्च व्हाउचर प्रीफिक्स / Expense Prefix *</label>
                <input
                  type="text"
                  required
                  value={expensePrefix}
                  onChange={(e) => setExpensePrefix(e.target.value)}
                  placeholder="उदा. EXP/26"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">सुरुवात खर्च व्हाउचर क्रमांक / Start Number *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expenseStartNumber}
                  onChange={(e) => setExpenseStartNumber(parseInt(e.target.value))}
                  placeholder="1"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          {role === 'MANDAL_ADMIN' && (
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl shadow-md active:scale-95 duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Save size={16} />
              <span>सेटिंग्ज जतन करा / Save Configuration</span>
            </button>
          )}

        </form>
      </div>

    </div>
  );
};

export default Settings;
