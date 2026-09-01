import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  FileText,
  User,
  X,
  CreditCard,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const Expenses = () => {
  const { t, activeFestivalId, role, hasPermission } = useApp();

  const [expenses, setExpenses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Decoration');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [vendorId, setVendorId] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
  });

  const fetchExpensesAndVendors = async () => {
    try {
      setLoading(true);
      const [expRes, vendRes] = await [
        await axios.get('/expenses', { params: { category: categoryFilter, status: statusFilter } }),
        await axios.get('/vendors'),
      ];

      setExpenses(expRes.data);
      setVendors(vendRes.data);

      // Calculations
      const total = expRes.data.reduce((sum, e) => sum + e.amount, 0);
      const paid = expRes.data.filter((e) => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);
      const pending = expRes.data.filter((e) => ['PENDING_APPROVAL', 'APPROVED'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0);

      setStats({ total, paid, pending });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndVendors();
  }, [categoryFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description || !amount || !paymentMode || !paidBy) {
      setFormError('Please fill all required fields');
      return;
    }

    setFormError('');
    try {
      await axios.post('/expenses', {
        category,
        description,
        amount,
        paymentMode,
        vendorId: vendorId || null,
        paidBy,
        notes,
        festivalId: activeFestivalId,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setModalOpen(false);
        clearForm();
        fetchExpensesAndVendors();
      }, 1500);

    } catch (err) {
      setFormError(err.response?.data?.message || 'Error recording expense');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/expenses/${id}/approve`);
      fetchExpensesAndVendors();
    } catch (e) {
      alert('Error approving expense');
    }
  };

  const handleReject = async (id) => {
    const rNotes = window.prompt('नोंद नाकारण्याचे कारण प्रविष्ट करा / Reason for Rejection:');
    if (rNotes === null) return;
    try {
      await axios.put(`/expenses/${id}/reject`, { notes: rNotes });
      fetchExpensesAndVendors();
    } catch (e) {
      alert('Error rejecting expense');
    }
  };

  const handlePay = async (id) => {
    try {
      await axios.put(`/expenses/${id}/pay`);
      fetchExpensesAndVendors();
    } catch (e) {
      alert('Error recording payment');
    }
  };

  const clearForm = () => {
    setCategory('Decoration');
    setDescription('');
    setAmount('');
    setPaymentMode('CASH');
    setVendorId('');
    setPaidBy('');
    setNotes('');
  };

  const handleExport = async (format) => {
    try {
      const res = await axios.get(`/reports/expenses/export?format=${format}`, {
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
      link.setAttribute('download', `expenses_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting expenses report:', err);
      alert('अहवाल डाउनलोड करताना त्रुटी आली. (Error exporting report)');
    }
  };

  const expenseCategories = [
    'Decoration',
    'Sound System',
    'Lighting',
    'Idol',
    'Pandal',
    'Prasad',
    'Cultural Events',
    'Security',
    'Electricity',
    'Cleaning',
    'Transportation',
    'Advertisement',
    'Social Work',
    'Miscellaneous',
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            खर्च व्यवस्थापन / Expense Book
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            उत्सवाशी संबंधित सर्व खर्चांची नोंदणी, मंजुरी आणि देयके
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
          
          {hasPermission('expenses:create') && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              <span>नवीन खर्च नोंद / Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-theme border-l-4 border-l-slate-400 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">एकूण खर्च (Total Logged)</div>
          <div className="text-lg font-extrabold text-slate-800 mt-1">₹{stats.total.toLocaleString('en-IN')}</div>
        </div>
        <div className="card-theme border-l-4 border-l-green-600 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">वितरित खर्च (Total Paid)</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">₹{stats.paid.toLocaleString('en-IN')}</div>
        </div>
        <div className="card-theme border-l-4 border-l-amber-500 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">प्रलंबित मंजूरी / देय (Pending approval)</div>
          <div className="text-lg font-extrabold text-amber-600 mt-1">₹{stats.pending.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="card-theme p-4 flex flex-col md:flex-row gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-none bg-white font-medium flex-1"
        >
          <option value="">सर्व वर्गवारी (All Categories)</option>
          {expenseCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-none bg-white font-medium flex-1"
        >
          <option value="">सर्व स्थिती (All Status)</option>
          <option value="DRAFT">DRAFT (मसुदा)</option>
          <option value="PENDING_APPROVAL">PENDING APPROVAL (मंजूरी प्रलंबित)</option>
          <option value="APPROVED">APPROVED (मंजूर)</option>
          <option value="PAID">PAID (वितरित)</option>
          <option value="REJECTED">REJECTED (अस्वीकृत)</option>
        </select>
      </div>

      {/* --- TABLE --- */}
      <div className="card-theme p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <th className="px-6 py-3.5">खर्च क्र. / Expense No</th>
                <th className="px-6 py-3.5">वर्गवारी / Category</th>
                <th className="px-6 py-3.5">तपशील / Description</th>
                <th className="px-6 py-3.5">विक्रेता / Vendor</th>
                <th className="px-6 py-3.5 text-right">रक्कम / Amount</th>
                <th className="px-6 py-3.5">पेमेंट प्रकार / Mode</th>
                <th className="px-6 py-3.5">स्थिती / Status</th>
                <th className="px-6 py-3.5 text-center">कृती / Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    खर्च नोंदी आढळल्या नाहीत (No expenses logged).
                  </td>
                </tr>
              ) : (
                expenses.map((e) => {
                  const isPending = e.status === 'PENDING_APPROVAL';
                  const isApproved = e.status === 'APPROVED';
                  const isPaid = e.status === 'PAID';
                  const isRejected = e.status === 'REJECTED';

                  return (
                    <tr key={e._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-800">{e.expenseNo}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-600">{e.category}</td>
                      <td className="px-6 py-3.5">
                        <div>{e.description}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Paid by: {e.paidBy}</div>
                        {e.notes && <div className="text-[9px] text-red-500 mt-0.5 font-semibold">Rejection Notes: {e.notes}</div>}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {e.vendorId ? e.vendorId.businessName || e.vendorId.name : 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-850">
                        ₹{e.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5">{e.paymentMode}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={
                            isPaid
                              ? 'badge-success'
                              : isApproved
                              ? 'badge-info'
                              : isPending
                              ? 'badge-warning'
                              : 'badge-danger'
                          }
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending && hasPermission('expenses:approve') && (
                            <>
                              <button
                                onClick={() => handleApprove(e._id)}
                                className="px-2.5 py-1 rounded bg-green-50 border border-green-200 text-green-700 font-bold text-[9px] hover:bg-green-100 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(e._id)}
                                className="px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-600 font-bold text-[9px] hover:bg-red-100 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {isApproved && hasPermission('expenses:pay') && (
                            <button
                              onClick={() => handlePay(e._id)}
                              className="px-2.5 py-1 rounded bg-orange-600 border border-orange-700 text-white font-bold text-[9px] hover:bg-orange-750 cursor-pointer shadow-sm"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                <span>खर्च नोंदवा / Record Expense</span>
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
                  <span>खर्च नोंद यशस्वीरित्या जतन झाली!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.category')} *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.description')} *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="उदा. मंडप आणि स्टेज सजावट साहित्य बिल"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.amount')} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₹ 15000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.vendor')}</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    <option value="">विक्रेता निवडा (None / Direct)</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.businessName || v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.paidBy')} *</label>
                  <input
                    type="text"
                    required
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="उदा. राहुल थोरात"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
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
                खर्च नोंदवा / Submit Expense
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Expenses;
