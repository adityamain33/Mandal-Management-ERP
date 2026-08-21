import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Search, Plus, Filter, CheckCircle, XCircle, FileSpreadsheet, User, Smartphone, Sparkles, X } from 'lucide-react';

const Donations = () => {
  const { t, activeFestivalId, role } = useApp();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('गणपती वर्गणी');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [status, setStatus] = useState('PENDING'); // PENDING or PAID
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/donations', {
        params: {
          status: statusFilter,
          purpose: purposeFilter,
        },
      });
      setDonations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, purposeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile || !amount || !purpose || !paymentMode) {
      setFormError('Please fill all required fields');
      return;
    }

    setFormError('');
    try {
      await axios.post('/donations', {
        name,
        mobile,
        email,
        address,
        amount,
        purpose,
        paymentMode,
        status,
        notes,
        festivalId: activeFestivalId,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setModalOpen(false);
        clearForm();
        fetchDonations();
      }, 1500);

    } catch (err) {
      setFormError(err.response?.data?.message || 'Error recording donation');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/donations/${id}/status`, { status: newStatus });
      fetchDonations();
    } catch (e) {
      alert('Error updating donation status');
    }
  };

  const clearForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setAmount('');
    setPurpose('गणपती वर्गणी');
    setPaymentMode('CASH');
    setStatus('PENDING');
    setNotes('');
  };

  const handleExport = async (format) => {
    try {
      const res = await axios.get(`/reports/donations/export?format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donations_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting donations report:', err);
      alert('अहवाल डाउनलोड करताना त्रुटी आली. (Error exporting report)');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            देणग्या व नवस / Donations Ledger
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            मंडळाला मिळालेल्या देणग्या आणि प्रलंबित वर्गणीची नोंदणी
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="btn-secondary text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} className="text-green-600" />
            <span>Excel Export</span>
          </button>
          
          {(role === 'MANDAL_ADMIN' || role === 'TREASURER' || role === 'RECEIPT_OPERATOR') && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>नवीन देणगी नोंद / Record Donation</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card-theme p-4 flex flex-col md:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-none bg-white font-medium flex-1"
        >
          <option value="">सर्व स्थिती (All Status)</option>
          <option value="PAID">PAID (जमा)</option>
          <option value="PENDING">PENDING (प्रलंबित)</option>
          <option value="CANCELLED">CANCELLED (रद्द)</option>
        </select>

        <select
          value={purposeFilter}
          onChange={(e) => setPurposeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-none bg-white font-medium flex-1"
        >
          <option value="">सर्व हेतू (All Purposes)</option>
          <option value="गणपती वर्गणी">गणपती वर्गणी</option>
          <option value="मुख्य देणगी">मुख्य देणगी</option>
          <option value="महाप्रसाद">महाप्रसाद</option>
          <option value="सजावट">सजावट</option>
          <option value="सांस्कृतिक कार्यक्रम">सांस्कृतिक कार्यक्रम</option>
          <option value="सामाजिक उपक्रम">सामाजिक उपक्रम</option>
          <option value="इतर">इतर</option>
        </select>
      </div>

      {/* Donations Table */}
      <div className="card-theme p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <th className="px-6 py-3.5">देणगीदार / Donor</th>
                <th className="px-6 py-3.5">हेतू / Purpose</th>
                <th className="px-6 py-3.5">पेमेंट मोड / Mode</th>
                <th className="px-6 py-3.5 text-right">रक्कम / Amount</th>
                <th className="px-6 py-3.5">स्थिती / Status</th>
                <th className="px-6 py-3.5">तारीख / Date</th>
                <th className="px-6 py-3.5 text-center">कृती / Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    देणगी नोंदी आढळल्या नाहीत (No donations logged).
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-800">{d.donorId?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.donorId?.mobile || ''}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-semibold">{d.purpose}</td>
                    <td className="px-6 py-3.5">
                      <span className="badge-info">{d.paymentMode}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">
                      ₹{d.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={
                          d.status === 'PAID'
                            ? 'badge-success'
                            : d.status === 'PENDING'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {d.status === 'PENDING' && (role === 'MANDAL_ADMIN' || role === 'TREASURER') && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'PAID')}
                            className="p-1 rounded bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 flex items-center gap-1 font-bold text-[10px] px-2 py-1"
                          >
                            <CheckCircle size={12} />
                            <span>Mark Paid</span>
                          </button>
                        )}
                        {d.status !== 'CANCELLED' && (role === 'MANDAL_ADMIN' || role === 'TREASURER') && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'CANCELLED')}
                            className="p-1 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 flex items-center gap-1 font-bold text-[10px] px-2 py-1"
                          >
                            <XCircle size={12} />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FORM MODAL --- */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Plus size={16} className="text-orange-600" />
                <span>नवीन देणगी नोंदवा / Record Donation</span>
              </h2>
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
                  <span>देणगी यशस्वीरित्या नोंदवली गेली!</span>
                </div>
              )}

              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide border-b border-slate-100 pb-1">
                १. देणगीदार माहिती / 1. Donor Info
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.fullName')} *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा. संजय विजय कांबळे"
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.mobile')} *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Smartphone size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@address.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="उदा. कोथरूड, पुणे"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide border-b border-slate-100 pb-1 mt-6">
                २. देणगी तपशील / 2. Donation Info
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.amount')} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="उदा. 25000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.purpose')} *</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    <option value="गणपती वर्गणी">गणपती वर्गणी</option>
                    <option value="मुख्य देणगी">मुख्य देणगी</option>
                    <option value="महाप्रसाद">महाप्रसाद</option>
                    <option value="सजावट">सजावट</option>
                    <option value="सांस्कृतिक कार्यक्रम">सांस्कृतिक कार्यक्रम</option>
                    <option value="सामाजिक उपक्रम">सामाजिक उपक्रम</option>
                    <option value="इतर">इतर</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.paymentMode')} *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK TRANSFER">BANK TRANSFER</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="ONLINE">ONLINE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">नोंदणी प्रकार / Entry Type *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    <option value="PENDING">PENDING (नवस / प्रलंबित)</option>
                    <option value="PAID">PAID (जमा - पावतीसह)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.notes')}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="शेरा..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer mt-6"
              >
                जतन करा / Record Donation
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Donations;
