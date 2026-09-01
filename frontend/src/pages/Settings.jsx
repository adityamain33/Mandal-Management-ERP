import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Settings as SettingsIcon, CheckCircle, Save, Building, FileText, Lock, X, Users, Key, ShieldCheck, CheckSquare, Square, Shield } from 'lucide-react';
import { MODULE_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS, ALL_PERMISSIONS } from '../utils/permissions.js';

const Settings = () => {
  const { role, activeMandalName, refetchUser, hasPermission, isAdmin } = useApp();

  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'users'

  // General Settings state
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

  // Users & Permissions State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userRole, setUserRole] = useState('MEMBER');
  const [userPermissions, setUserPermissions] = useState([]);
  const [userSaveLoading, setUserSaveLoading] = useState(false);
  const [userSuccess, setUserSuccess] = useState(false);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      setUsersLoading(true);
      const res = await axios.get('/users');
      setUsersList(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserRole(u.role);
    setUserPermissions(u.effectivePermissions || ROLE_DEFAULT_PERMISSIONS[u.role] || []);
    setUserSuccess(false);
    setEditUserModal(true);
  };

  const handleUserRoleChange = (newRole) => {
    setUserRole(newRole);
    if (newRole === 'MANDAL_ADMIN' || newRole === 'SUPER_ADMIN') {
      setUserPermissions(ALL_PERMISSIONS);
    } else {
      setUserPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || ROLE_DEFAULT_PERMISSIONS.MEMBER);
    }
  };

  const handleToggleUserPermission = (permId) => {
    if (userPermissions.includes(permId)) {
      setUserPermissions(userPermissions.filter((p) => p !== permId));
    } else {
      setUserPermissions([...userPermissions, permId]);
    }
  };

  const handleToggleUserModule = (modulePermissions) => {
    const permIds = modulePermissions.map((p) => p.id);
    const allSelected = permIds.every((id) => userPermissions.includes(id));
    if (allSelected) {
      setUserPermissions(userPermissions.filter((id) => !permIds.includes(id)));
    } else {
      setUserPermissions(Array.from(new Set([...userPermissions, ...permIds])));
    }
  };

  const handleSaveUserPermissions = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setUserSaveLoading(true);
      await axios.put(`/users/${editingUser._id}/permissions`, {
        role: userRole,
        customPermissions: userPermissions,
      });
      setUserSuccess(true);
      setTimeout(() => {
        setUserSuccess(false);
        setEditUserModal(false);
        fetchUsers();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving user permissions');
    } finally {
      setUserSaveLoading(false);
    }
  };

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
      const mandal = userProfile.mandalRoles?.[0]?.mandalId;
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
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'MANDAL_ADMIN' && role !== 'SUPER_ADMIN') {
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
            <span>सेटिंग्ज व ॲक्सेस परवानग्या / System Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            मंडळाचे नियम, पावती आकडे आणि सदस्यांचे परवानग्या व्यवस्थापन
          </p>
        </div>

        {/* Tab Navigation */}
        {isAdmin && (
          <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'general' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building size={14} />
              <span>सामान्य सेटिंग्ज (General)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                fetchUsers();
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={14} />
              <span>वापरकर्ते व परवानग्या (User Access)</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'general' ? (
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
            {(role === 'MANDAL_ADMIN' || role === 'SUPER_ADMIN') && (
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
      ) : (
        /* --- USERS & ACCESS CONTROL TAB --- */
        <div className="space-y-6">
          <div className="card-theme bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <Shield size={16} className="text-indigo-600" />
                  <span>मंडळातील वापरकर्ते व ॲक्सेस यादी / Users & Permissions List</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  ॲडमिन यादीतील कोणत्याही वापरकर्त्याला कोणत्या गोष्टी दाखवायच्या हे थेट नियंत्रित करू शकतो.
                </p>
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start">
                एकूण वापरकर्ते: <span className="text-indigo-600">{usersList.length}</span>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading users...</div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">कोणतेही वापरकर्ते सापडले नाहीत.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase bg-slate-50/50">
                    <tr>
                      <th className="p-3">नाव / Name</th>
                      <th className="p-3">लॉगिन ईमेल / मोबाईल</th>
                      <th className="p-3">भूमिका / Role</th>
                      <th className="p-3">सक्रिय परवानग्या / Permissions</th>
                      <th className="p-3 text-right">कृती / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {usersList.map((u) => {
                      const rBadge = ROLE_LABELS[u.role] || { mr: u.role, color: 'bg-slate-100 text-slate-700' };
                      const permCount = u.effectivePermissions ? u.effectivePermissions.length : (u.role === 'MANDAL_ADMIN' ? ALL_PERMISSIONS.length : 0);

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-bold text-slate-800 flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {u.name ? u.name[0] : 'U'}
                            </div>
                            <div>
                              <div>{u.name}</div>
                              {u.memberId && (
                                <span className="text-[9px] text-slate-400 font-normal">
                                  समिती सदस्य लिंक
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>{u.email}</div>
                            <div className="text-[10px] text-slate-400">{u.mobile}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${rBadge.color}`}>
                              {rBadge.mr}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                              {u.role === 'MANDAL_ADMIN' || u.role === 'SUPER_ADMIN' ? 'सर्व परवानग्या (All / Full Access)' : `${permCount} परवानग्या सक्रिय`}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 py-1.5 px-3 text-xs font-bold transition cursor-pointer border border-orange-200"
                            >
                              <Key size={13} />
                              <span>परवानग्या बदला</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- EDIT USER PERMISSIONS MODAL --- */}
      {editUserModal && editingUser && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditUserModal(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Key size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    वापरकर्ता परवानग्या बदला / Edit User Access
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">
                    वापरकर्ता: <strong className="text-slate-700">{editingUser.name}</strong> ({editingUser.email})
                  </p>
                </div>
              </div>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer" onClick={() => setEditUserModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={handleSaveUserPermissions}>
              {userSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>परवानग्या यशस्वीरित्या सेव्ह झाल्या!</span>
                </div>
              )}

              {/* Role Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  भूमिका (Role Preset) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'MANDAL_ADMIN', label: 'मंडळ प्रशासक (Admin)', desc: 'पूर्ण ॲक्सेस' },
                    { id: 'TREASURER', label: 'खजिनदार (Treasurer)', desc: 'पावती, देणगी, खर्च' },
                    { id: 'ACCOUNTANT', label: 'हिशोबनीस (Accountant)', desc: 'हिशोब व अहवाल' },
                    { id: 'MEMBER', label: 'मंडळ सदस्य (Member)', desc: 'मर्यादित ॲक्सेस' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleUserRoleChange(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        userRole === r.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800">{r.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permission Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      सविस्तर परवानग्या (Granular Permission Access)
                    </label>
                    <p className="text-[10px] text-slate-400">
                      या वापरकर्त्याला कोणत्या विभागाचा ॲक्सेस द्यायचा आहे ते निवडा:
                    </p>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setUserPermissions(ALL_PERMISSIONS)}
                      className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      सर्व निवडा (All)
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setUserPermissions([])}
                      className="text-[11px] text-slate-500 hover:underline font-bold cursor-pointer"
                    >
                      सर्व काढा (Clear)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {MODULE_PERMISSIONS.map((mod) => {
                    const modPermIds = mod.permissions.map((p) => p.id);
                    const allSelected = modPermIds.every((id) => userPermissions.includes(id));

                    return (
                      <div key={mod.module} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                            {mod.title}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleUserModule(mod.permissions)}
                            className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                          >
                            {allSelected ? <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} />}
                            <span>{allSelected ? 'काढा (Unselect)' : 'सर्व निवडा'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {mod.permissions.map((p) => {
                            const isChecked = userPermissions.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                                  isChecked ? 'bg-indigo-50/60 text-indigo-900 border border-indigo-100' : 'hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleUserPermission(p.id)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{p.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करा / Cancel
                </button>
                <button
                  type="submit"
                  disabled={userSaveLoading}
                  className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>{userSaveLoading ? 'सेव्ह होत आहे...' : 'परवानग्या सेव्ह करा / Update Permissions'}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      
    </div>
  );
};

export default Settings;
