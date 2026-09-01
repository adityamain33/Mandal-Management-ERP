import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import {
  Plus,
  Search,
  Trash2,
  ShieldCheck,
  Mail,
  Smartphone,
  CheckCircle,
  X,
  Key,
  Shield,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import { MODULE_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS, ALL_PERMISSIONS } from '../utils/permissions.js';

const Members = () => {
  const { hasPermission, isAdmin } = useApp();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Member Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Member');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Permission / Login Modal States
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('Password123');
  const [assignedRole, setAssignedRole] = useState('MEMBER');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState('');
  const [permSuccess, setPermSuccess] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/members', { params: { search } });
      setMembers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      setFormError('Name and Mobile are required');
      return;
    }

    try {
      await axios.post('/members', {
        name,
        mobile,
        email,
        address,
        role,
        bloodGroup,
        emergencyContact,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setModalOpen(false);
        clearForm();
        fetchMembers();
      }, 1500);

    } catch (err) {
      setFormError(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्हाला खरोखर हा सदस्य हटवायचा आहे का?')) return;
    try {
      await axios.delete(`/members/${id}`);
      fetchMembers();
    } catch (e) {
      alert('सदस्य हटवण्यात अडचण आली.');
    }
  };

  const clearForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setRole('Member');
    setBloodGroup('Unknown');
    setEmergencyContact('');
  };

  // Open Permission Modal for a Member
  const handleOpenPermModal = (m) => {
    setSelectedMember(m);
    setLoginEmail(m.email || `${m.mobile}@mandalsetu.local`);
    setLoginMobile(m.mobile);
    setLoginPassword('Password123');
    
    // Auto-detect role preset
    let defaultR = 'MEMBER';
    if (m.role === 'Treasurer') defaultR = 'TREASURER';
    else if (m.role === 'Secretary' || m.role === 'President') defaultR = 'MANDAL_ADMIN';
    else if (m.role === 'Volunteer') defaultR = 'MEMBER';

    setAssignedRole(defaultR);
    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[defaultR] || ROLE_DEFAULT_PERMISSIONS.MEMBER);
    setPermError('');
    setPermSuccess(false);
    setPermModalOpen(true);
  };

  const handleRolePresetChange = (newRole) => {
    setAssignedRole(newRole);
    if (newRole === 'MANDAL_ADMIN' || newRole === 'SUPER_ADMIN') {
      setSelectedPermissions(ALL_PERMISSIONS);
    } else {
      setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || ROLE_DEFAULT_PERMISSIONS.MEMBER);
    }
  };

  const handleTogglePermission = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleToggleModule = (modulePermissions) => {
    const permIds = modulePermissions.map((p) => p.id);
    const allSelected = permIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Uncheck all in this module
      setSelectedPermissions(selectedPermissions.filter((id) => !permIds.includes(id)));
    } else {
      // Check all in this module
      const combined = Array.from(new Set([...selectedPermissions, ...permIds]));
      setSelectedPermissions(combined);
    }
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    if (!loginPassword || loginPassword.length < 6) {
      setPermError('पासवर्ड किमान ६ अक्षरांचा असावा / Password must be at least 6 characters');
      return;
    }

    setPermLoading(true);
    setPermError('');

    try {
      await axios.post(`/members/${selectedMember._id}/login`, {
        email: loginEmail,
        mobile: loginMobile,
        password: loginPassword,
        role: assignedRole,
        customPermissions: selectedPermissions,
      });

      setPermSuccess(true);
      setTimeout(() => {
        setPermSuccess(false);
        setPermModalOpen(false);
        fetchMembers();
      }, 1500);
    } catch (err) {
      setPermError(err.response?.data?.message || 'परवानग्या सेव्ह करताना अडचण आली / Error saving permissions');
    } finally {
      setPermLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            मंडळ सदस्य व परवानग्या / Members & Access Control
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            उत्सव व्यवस्थापन समितीचे सर्व कार्यकर्ते व त्यांच्या ॲक्सेस परवानग्या
          </p>
        </div>

        {hasPermission('members:manage') && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs font-semibold py-2.5 px-4 flex items-center gap-2 self-start cursor-pointer shadow-md"
          >
            <Plus size={16} />
            <span>नवीन सदस्य जोडा / Add Member</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="card-theme p-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="नाव किंवा मोबाईल नंबरने शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none bg-slate-50/50"
          />
        </div>
      </div>

      {/* Members Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">Loading Members...</div>
        ) : members.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">No committee members logged.</div>
        ) : (
          members.map((m) => (
            <div key={m._id} className="card-theme hover:shadow-md transition-all duration-200 relative flex flex-col justify-between border border-slate-100 p-5 rounded-2xl bg-white">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                      {m.name ? m.name[0] : 'M'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{m.name}</h4>
                      <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded-full font-bold mt-1 inline-block uppercase">
                        {m.role}
                      </span>
                    </div>
                  </div>
                  <span className="badge-success text-[10px]">{m.status}</span>
                </div>

                <div className="mt-4 space-y-1.5 text-slate-500 text-xs border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Smartphone size={13} className="text-slate-400" />
                    <span>{m.mobile}</span>
                  </div>
                  {m.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    रक्तगट: <span className="font-bold text-slate-700">{m.bloodGroup}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {(hasPermission('members:permissions') || isAdmin) ? (
                  <button
                    onClick={() => handleOpenPermModal(m)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 px-2.5 text-xs font-bold transition duration-150 cursor-pointer border border-indigo-200/50"
                  >
                    <Key size={13} />
                    <span>परवानग्या व लॉगिन / Permissions</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-400 font-medium">सक्रिय सदस्य</div>
                )}

                {hasPermission('members:manage') && (
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Remove Member"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD MEMBER FORM MODAL --- */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800">नवीन सदस्य जोडा / Register Member</h2>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50 cursor-pointer" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={handleSubmit}>
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>सदस्य जोडणी यशस्वी झाली!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">सदस्याचे नाव / Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. तुषार विठ्ठल जाधव"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">मोबाईल / Mobile *</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9881007788"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">ईमेल / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">पद / Position (Role) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    <option value="President">President (अध्यक्ष)</option>
                    <option value="Vice President">Vice President (उपाध्यक्ष)</option>
                    <option value="Secretary">Secretary (सचिव)</option>
                    <option value="Treasurer">Treasurer (खजिनदार)</option>
                    <option value="Committee Member">Committee Member (समिती सदस्य)</option>
                    <option value="Volunteer">Volunteer (कार्यकर्ता)</option>
                    <option value="Member">Member (सामान्य सदस्य)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">रक्तगट / Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">आपत्कालीन संपर्क / Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">पत्ता / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="उदा. सदाशिव पेठ, पुणे"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer mt-6"
              >
                सदस्य जोडा / Save Member
              </button>
            </form>
          </div>
        </>
      )}

      {/* --- MEMBER LOGIN & PERMISSION MANAGEMENT MODAL --- */}
      {permModalOpen && selectedMember && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPermModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            
            {/* Modal Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Shield size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    परवानग्या व लॉगिन व्यवस्थापन / Manage Access
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">
                    सदस्य: <strong className="text-slate-700">{selectedMember.name}</strong> ({selectedMember.role})
                  </p>
                </div>
              </div>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer" onClick={() => setPermModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={handleSavePermissions}>
              
              {permError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                  {permError}
                </div>
              )}

              {permSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>लॉगिन व परवानग्या यशस्वीरित्या सेव्ह झाल्या!</span>
                </div>
              )}

              {/* Login Credentials Section */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                  <Key size={14} />
                  <span>१. लॉगिन माहिती (Login Account)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">मोबाईल / Mobile *</label>
                    <input
                      type="text"
                      required
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ईमेल / Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">पासवर्ड / Password *</label>
                    <input
                      type="text"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password123"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Role Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  २. भूमिका निवडा (Role Preset) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'MANDAL_ADMIN', label: 'मंडळ प्रशासक (Admin)', desc: 'पूर्ण ॲक्सेस (All)' },
                    { id: 'TREASURER', label: 'खजिनदार (Treasurer)', desc: 'पावती, देणगी, खर्च, हिशोब' },
                    { id: 'ACCOUNTANT', label: 'हिशोबनीस (Accountant)', desc: 'हिशोब व पावत्या' },
                    { id: 'MEMBER', label: 'मंडळ सदस्य (Member)', desc: 'डॅशबोर्ड, कार्यक्रम, कामे' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRolePresetChange(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        assignedRole === r.id
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

              {/* Granular Permission Checklist (Admin decides what to show) */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      ३. सविस्तर परवानग्या (Granular Permission Settings)
                    </label>
                    <p className="text-[10px] text-slate-400">
                      ॲडमिन ठरवू शकतो या सदस्याला कोणत्या गोष्टी दाखवायच्या आणि कोणत्या लपवायच्या:
                    </p>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(ALL_PERMISSIONS)}
                      className="text-[11px] text-indigo-600 hover:underline font-bold"
                    >
                      सर्व निवडा (All)
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-[11px] text-slate-500 hover:underline font-bold"
                    >
                      सर्व काढा (Clear)
                    </button>
                  </div>
                </div>

                {/* Modules Accordion / List */}
                <div className="space-y-4">
                  {MODULE_PERMISSIONS.map((mod) => {
                    const modPermIds = mod.permissions.map((p) => p.id);
                    const allSelected = modPermIds.every((id) => selectedPermissions.includes(id));
                    const someSelected = modPermIds.some((id) => selectedPermissions.includes(id));

                    return (
                      <div key={mod.module} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        
                        {/* Module Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                            {mod.title}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleModule(mod.permissions)}
                            className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                          >
                            {allSelected ? <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} />}
                            <span>{allSelected ? 'काढा (Unselect)' : 'सर्व परवानग्या द्या'}</span>
                          </button>
                        </div>

                        {/* Individual Permission Checkboxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {mod.permissions.map((p) => {
                            const isChecked = selectedPermissions.includes(p.id);
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
                                  onChange={() => handleTogglePermission(p.id)}
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

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPermModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करा / Cancel
                </button>
                <button
                  type="submit"
                  disabled={permLoading}
                  className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>{permLoading ? 'सेव्ह होत आहे...' : 'परवानग्या लागू करा / Save Permissions'}</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Members;

