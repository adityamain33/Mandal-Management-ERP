import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Share2,
  Printer,
  X,
  User,
  Smartphone,
  MapPin,
  Mail,
  CheckCircle,
  Receipt,
} from 'lucide-react';

const Receipts = () => {
  const { t, activeFestivalId, settings, role, hasPermission } = useApp();

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('गणपती वर्गणी');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    average: 0,
  });

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/receipts', {
        params: {
          search,
          paymentMode: modeFilter,
        },
      });
      
      let data = res.data.receipts || [];
      // Client filter for purpose since backend handles pagination/indexing
      if (purposeFilter) {
        data = data.filter((r) => r.donationId?.purpose === purposeFilter);
      }

      setReceipts(data);

      // Compile local totals
      const activeReceipts = data.filter((r) => r.status === 'ACTIVE');
      const totalAmount = activeReceipts.reduce((sum, r) => sum + r.amount, 0);
      const count = activeReceipts.length;
      const average = count > 0 ? Math.round(totalAmount / count) : 0;

      setStats({ total: totalAmount, count, average });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [search, purposeFilter, modeFilter]);

  const handleSubmit = async (e, actionType) => {
    e.preventDefault();
    if (!name || !mobile || !amount || !purpose || !paymentMode) {
      setFormError('कृपया सर्व आवश्यक फील्ड भरा / Please fill all required fields');
      return;
    }

    setFormError('');
    try {
      const res = await axios.post('/receipts', {
        name,
        mobile,
        email,
        address,
        amount,
        purpose,
        paymentMode,
        notes,
        festivalId: activeFestivalId,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setModalOpen(false);
        clearForm();
        fetchReceipts();

        // Handle auto actions
        if (actionType === 'print' || actionType === 'whatsapp') {
          handleDownloadPDF(res.data.receipt._id, res.data.receipt.receiptNo);
        }
        if (actionType === 'whatsapp') {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const serverRoot = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
          const receiptUrl = `${serverRoot}/uploads/receipts/receipt_${res.data.receipt.receiptNo.replace(/\//g, '_')}.pdf`;
          
          const text = `नमस्कार! श्री गणेश मित्र मंडळातर्फे आपल्या ₹${amount} वर्गणीची पावती यशस्वीरीत्या जमा झाली आहे.
पावती क्रमांक: ${res.data.receipt.receiptNo}
पावती डाउनलोड करण्यासाठी खालील लिंकवर क्लिक करा:
${receiptUrl}`;
          window.open(`https://api.whatsapp.com/send?phone=91${mobile}&text=${encodeURIComponent(text)}`, '_blank');
        }
      }, 1500);

    } catch (err) {
      setFormError(err.response?.data?.message || 'पावती जतन करताना त्रुटी आली. पुन्हा प्रयत्न करा.');
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
    setNotes('');
  };

  const handleDownloadPDF = async (id, receiptNo) => {
    try {
      const res = await axios.get(`/receipts/${id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const formattedNo = receiptNo ? receiptNo.replace(/\//g, '_') : id;
      link.setAttribute('download', `receipt_${formattedNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('पावती डाउनलोड करताना त्रुटी आली. (Error downloading PDF)');
    }
  };

  const handleCancelReceipt = async (id) => {
    if (!window.confirm(t('receipts.cancelConfirm'))) return;
    try {
      await axios.put(`/receipts/${id}/cancel`);
      fetchReceipts();
    } catch (err) {
      alert('पावती रद्द करू शकलो नाही / Error cancelling receipt');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await axios.get(`/reports/receipts/export?format=${format}`, {
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
      link.setAttribute('download', `receipts_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting receipts report:', err);
      alert('अहवाल डाउनलोड करताना त्रुटी आली. (Error exporting report)');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{t('receipts.book')}</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
              {t('receipts.series')}: {settings?.receiptPrefix || 'GM/26'}
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            मंडळाच्या जमा पावत्यांचे डिजिटल संकलन व संपादन
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="btn-secondary text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} className="text-green-600" />
            <span>{t('receipts.exportExcel')}</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="btn-secondary text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
          >
            <Download size={15} className="text-slate-500" />
            <span>{t('receipts.exportCsv')}</span>
          </button>
          
          {hasPermission('receipts:create') && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              <span>नवीन पावती तयार करा</span>
            </button>
          )}
        </div>
      </div>

      {/* --- STATISTICS SUMMARY --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-theme border-l-4 border-l-green-500 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('receipts.statsTotal')}</div>
          <div className="text-lg font-extrabold text-slate-800 mt-1">₹{stats.total.toLocaleString('en-IN')}</div>
        </div>
        <div className="card-theme border-l-4 border-l-indigo-600 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('receipts.statsCount')}</div>
          <div className="text-lg font-extrabold text-slate-800 mt-1">{stats.count}</div>
        </div>
        <div className="card-theme border-l-4 border-l-orange-500 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('receipts.statsAvg')}</div>
          <div className="text-lg font-extrabold text-slate-800 mt-1">₹{stats.average.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* --- FILTER BLOCK --- */}
      <div className="card-theme p-4 flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder={t('receipts.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Purpose Filter */}
        <select
          value={purposeFilter}
          onChange={(e) => setPurposeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-none bg-white font-medium"
        >
          <option value="">{t('receipts.allCategories')}</option>
          <option value="गणपती वर्गणी">गणपती वर्गणी</option>
          <option value="मुख्य देणगी">मुख्य देणगी</option>
          <option value="महाप्रसाद">महाप्रसाद</option>
          <option value="सजावट">सजावट</option>
          <option value="सांस्कृतिक कार्यक्रम">सांस्कृतिक कार्यक्रम</option>
          <option value="सामाजिक उपक्रम">सामाजिक उपक्रम</option>
          <option value="इतर">इतर</option>
        </select>

        {/* Mode Filter */}
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-none bg-white font-medium"
        >
          <option value="">{t('receipts.allModes')}</option>
          <option value="CASH">CASH</option>
          <option value="UPI">UPI</option>
          <option value="BANK TRANSFER">BANK TRANSFER</option>
          <option value="CHEQUE">CHEQUE</option>
          <option value="ONLINE">ONLINE</option>
        </select>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="card-theme p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">{t('receipts.tableNo')}</th>
                <th className="px-6 py-3.5">{t('receipts.tableDonor')}</th>
                <th className="px-6 py-3.5">{t('receipts.tablePurpose')}</th>
                <th className="px-6 py-3.5">{t('receipts.tableMode')}</th>
                <th className="px-6 py-3.5 text-right">{t('receipts.tableAmount')}</th>
                <th className="px-6 py-3.5">{t('receipts.tableCollector')}</th>
                <th className="px-6 py-3.5">{t('receipts.tableDate')}</th>
                <th className="px-6 py-3.5 text-center">{t('receipts.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400 animate-pulse">
                    माहिती लोड होत आहे... (Loading...)
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <Receipt size={32} className="text-slate-300" />
                      <span className="font-semibold">कोणत्याही पावत्या आढळल्या नाहीत (No receipts found).</span>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((r) => {
                  const donor = r.donationId?.donorId;
                  const isCancelled = r.status === 'CANCELLED';
                  return (
                    <tr
                      key={r._id}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 ${
                        isCancelled ? 'bg-red-50/10 text-slate-400 line-through' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5 font-bold text-slate-800">{r.receiptNo}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold">{donor?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{donor?.mobile || ''}</div>
                      </td>
                      <td className="px-6 py-3.5">{r.donationId?.purpose || 'N/A'}</td>
                      <td className="px-6 py-3.5">
                        <span className={isCancelled ? 'text-slate-400' : 'badge-info'}>{r.paymentMode}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">
                        ₹{r.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{r.collectorId?.name || 'N/A'}</td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDownloadPDF(r._id, r.receiptNo)}
                            className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                            title="Print / View"
                          >
                            <Printer size={13} />
                          </button>
                          {!isCancelled && (
                            <>
                              <button
                                onClick={() => {
                                  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                  const serverRoot = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
                                  const receiptUrl = `${serverRoot}/uploads/receipts/receipt_${r.receiptNo.replace(/\//g, '_')}.pdf`;

                                  const text = `नमस्कार! श्री गणेश मित्र मंडळातर्फे आपल्या ₹${r.amount} वर्गणीची पावती यशस्वीरीत्या जमा झाली आहे.
पावती क्रमांक: ${r.receiptNo}
पावती डाउनलोड करण्यासाठी खालील लिंकवर क्लिक करा:
${receiptUrl}`;
                                  window.open(`https://api.whatsapp.com/send?phone=91${donor?.mobile}&text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="p-1 rounded bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                                title="WhatsApp"
                              >
                                <Share2 size={13} />
                              </button>
                              {hasPermission('receipts:cancel') && (
                                <button
                                  onClick={() => handleCancelReceipt(r._id)}
                                  className="p-1 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer"
                                  title="Cancel Receipt"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </>
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

      {/* --- CREATE RECEIPT MODAL --- */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            {/* Modal Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Plus size={16} className="text-orange-600" />
                <span>पावती तयार करा / Create Receipt</span>
              </h2>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={(e) => handleSubmit(e, 'save')}>
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>पावती यशस्वीरीत्या जतन झाली! (Receipt Saved!)</span>
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
                      placeholder="उदा. महेश कुळकर्णी"
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
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.address')}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MapPin size={14} />
                    </span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="उदा. सदाशिव पेठ, पुणे"
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
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
                    placeholder="उदा. 501"
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
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('forms.notes')}</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="शेरा..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Submit panel buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer"
                >
                  {t('forms.saveReceipt')}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'print')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Printer size={13} />
                    <span>{t('forms.savePrint')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'whatsapp')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Share2 size={13} />
                    <span>{t('forms.saveWhatsApp')}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Receipts;
