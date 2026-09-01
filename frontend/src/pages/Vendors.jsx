import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Search, Store, Smartphone, MapPin, CreditCard, Plus, CheckCircle, X } from 'lucide-react';

const Vendors = () => {
  const { hasPermission } = useApp();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [category, setCategory] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/vendors', { params: { search } });
      setVendors(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProfile = async (id) => {
    try {
      setProfileLoading(true);
      const res = await axios.get(`/vendors/${id}`);
      setVendorProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search]);

  useEffect(() => {
    if (selectedVendor) {
      fetchVendorProfile(selectedVendor._id);
    } else {
      setVendorProfile(null);
    }
  }, [selectedVendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      setFormError('Name and Mobile are required');
      return;
    }

    try {
      await axios.post('/vendors', {
        name,
        businessName,
        mobile,
        email,
        address,
        gstNo,
        category,
        bankDetails: {
          accountNo,
          ifscCode,
          bankName,
        },
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setModalOpen(false);
        clearForm();
        fetchVendors();
      }, 1500);

    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating vendor');
    }
  };

  const clearForm = () => {
    setName('');
    setBusinessName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setGstNo('');
    setCategory('');
    setAccountNo('');
    setIfscCode('');
    setBankName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            विक्रेते आणि व्यावसायिक / Vendor Profiles
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            मंडपाचे साहित्य, मूर्ती, रोषणाई आणि जेवण पुरवठादारांचे रेकॉर्ड्स
          </p>
        </div>

        {hasPermission('vendors:manage') && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 self-start cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>नवीन विक्रेता नोंदणी / Add Vendor</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card-theme p-4 space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="विक्रेता शोधा..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading...</div>
              ) : vendors.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">विक्रेते आढळले नाहीत.</div>
              ) : (
                vendors.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVendor(v)}
                    className={`w-full text-left rounded-xl p-3 text-xs transition-all border duration-150 flex items-center gap-3 ${
                      selectedVendor?._id === v._id
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {v.businessName ? v.businessName[0] : v.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate">{v.businessName || v.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{v.mobile} • {v.category || 'Direct'}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: selected vendor */}
        <div className="lg:col-span-2">
          {!selectedVendor ? (
            <div className="card-theme h-full flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-2">
              <Store size={40} className="text-slate-200" />
              <span className="font-semibold text-xs">विक्रेता निवडा आणि त्याचे व्यवहार पहा.</span>
            </div>
          ) : profileLoading ? (
            <div className="card-theme h-full flex flex-col items-center justify-center py-20 text-center text-slate-400 animate-pulse">
              <span className="font-semibold text-xs">माहिती लोड होत आहे...</span>
            </div>
          ) : !vendorProfile ? (
            <div className="card-theme h-full flex items-center justify-center py-20 text-center text-slate-400">
              <span className="font-semibold text-xs">प्रोफाईल लोड करता आले नाही.</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Profile card details */}
              <div className="card-theme space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                    {vendorProfile.vendor.businessName ? vendorProfile.vendor.businessName[0] : vendorProfile.vendor.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">
                      {vendorProfile.vendor.businessName || vendorProfile.vendor.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Contact: {vendorProfile.vendor.name} • {vendorProfile.vendor.mobile}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">एकूण व्यवहार / Total purchases</div>
                    <div className="text-base font-extrabold text-slate-850 mt-1">₹{vendorProfile.stats.totalPurchases.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">एकूण देयके / Paid</div>
                    <div className="text-base font-extrabold text-green-600 mt-1">₹{vendorProfile.stats.totalPaid.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-extrabold text-red-500">शिल्लक देय रक्कम / Pending</div>
                    <div className="text-base font-extrabold text-red-600 mt-1">₹{vendorProfile.stats.pendingAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Bank / GST details */}
                <div className="text-xs text-slate-650 space-y-1.5 pt-2">
                  {vendorProfile.vendor.gstNo && (
                    <div><strong>GSTIN:</strong> {vendorProfile.vendor.gstNo}</div>
                  )}
                  {vendorProfile.vendor.address && (
                    <div className="flex items-start gap-1.5">
                      <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <span><strong>पत्ता:</strong> {vendorProfile.vendor.address}</span>
                    </div>
                  )}
                  {vendorProfile.vendor.bankDetails?.accountNo && (
                    <div className="flex items-start gap-1.5 border-t border-slate-50 pt-2 mt-2">
                      <CreditCard size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <strong>बँक खाते तपशील / Bank Details:</strong>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {vendorProfile.vendor.bankDetails.bankName} • A/C No: {vendorProfile.vendor.bankDetails.accountNo} • IFSC: {vendorProfile.vendor.bankDetails.ifscCode}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions log */}
              <div className="card-theme space-y-4">
                <h4 className="font-bold text-xs text-slate-700 border-b border-slate-50 pb-2">खर्च इतिहास / Expense Timeline</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                        <th className="py-2.5">तारीख / Date</th>
                        <th className="py-2.5">खर्च क्र. / Expense No</th>
                        <th className="py-2.5">श्रेणी / Category</th>
                        <th className="py-2.5">वर्णन / Description</th>
                        <th className="py-2.5 text-right">रक्कम / Amount</th>
                        <th className="py-2.5">स्थिती / Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorProfile.expenses.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-400">खर्च इतिहास उपलब्ध नाही.</td>
                        </tr>
                      ) : (
                        vendorProfile.expenses.map((exp) => (
                          <tr key={exp._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                            <td className="py-3 font-bold text-slate-800">{exp.expenseNo}</td>
                            <td className="py-3 text-slate-600">{exp.category}</td>
                            <td className="py-3 text-slate-500">{exp.description}</td>
                            <td className="py-3 text-right font-extrabold text-slate-850">₹{exp.amount.toLocaleString('en-IN')}</td>
                            <td className="py-3">
                              <span
                                className={
                                  exp.status === 'PAID'
                                    ? 'badge-success'
                                    : exp.status === 'APPROVED'
                                    ? 'badge-info'
                                    : exp.status === 'PENDING_APPROVAL'
                                    ? 'badge-warning'
                                    : 'badge-danger'
                                }
                              >
                                {exp.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
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
                <span>नवीन विक्रेता नोंदणी / Register Vendor</span>
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
                  <span>विक्रेता यशस्वीरीत्या नोंदवला गेला!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">नाव / Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. रामभाऊ मांडववाले"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">व्यवसाय नाव / Shop Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="उदा. रामभाऊ डेकोरेटर्स"
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
                    placeholder="9922112233"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">ईमेल / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@shop.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">जीएसटी नंबर / GSTIN</label>
                  <input
                    type="text"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    placeholder="27AAAAA0000A1Z2"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">श्रेणी / Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="उदा. Pandal / Sound / Prasad"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">पत्ता / Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="उदा. शुक्रवार पेठ, पुणे"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide border-b border-slate-100 pb-1 mt-6">
                बँक तपशील / Bank Account Details
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">बँक नाव / Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="उदा. State Bank of India"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">खाते क्रमांक / Account Number</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    placeholder="1234567890"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">आयएफएससी कोड / IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="SBIN0001234"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer mt-6"
              >
                नोंदणी जतन करा / Save Vendor
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Vendors;
