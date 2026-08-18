import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, ShieldCheck, Mail, Smartphone, CheckCircle, X } from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form Modal States
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            मंडळ सदस्य / Committee Members
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            उत्सव व्यवस्थापन समितीचे सर्व अध्यक्ष, सचिव आणि कार्यकर्ते
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 self-start"
        >
          <Plus size={15} />
          <span>नवीन सदस्य जोडा / Add Member</span>
        </button>
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
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none bg-slate-50/50"
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
            <div key={m._id} className="card-theme hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-700 font-bold flex items-center justify-center text-sm border border-orange-100">
                    {m.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{m.name}</h4>
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-bold mt-1 inline-block uppercase">
                      {m.role}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-slate-500 text-xs">
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
                  <div className="text-[10px] text-slate-400 pt-1">
                    Blood Group: <span className="font-bold text-slate-700">{m.bloodGroup}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="badge-success">{m.status}</span>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50"
                  title="Remove Member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- FORM MODAL --- */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800">नवीन सदस्य जोडा / Register Member</h2>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setModalOpen(false)}>
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

    </div>
  );
};

export default Members;
