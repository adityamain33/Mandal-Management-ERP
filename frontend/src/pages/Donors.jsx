import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Smartphone, Mail, MapPin, IndianRupee, History, Plus } from 'lucide-react';

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/donors', { params: { search } });
      setDonors(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonorProfile = async (id) => {
    try {
      setProfileLoading(true);
      const res = await axios.get(`/donors/${id}`);
      setDonorProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [search]);

  useEffect(() => {
    if (selectedDonor) {
      fetchDonorProfile(selectedDonor._id);
    } else {
      setDonorProfile(null);
    }
  }, [selectedDonor]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          देणगीदार / Donors Directory
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          मंडळाच्या सर्व देणगीदारांचे संपर्क व योगदान रेकॉर्ड्स
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Donor List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card-theme p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="देणगीदार शोधा..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50"
              />
            </div>

            {/* List */}
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">शोध सुरू आहे...</div>
              ) : donors.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">एकूण देणगीदार आढळले नाहीत.</div>
              ) : (
                donors.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => setSelectedDonor(d)}
                    className={`w-full text-left rounded-xl p-3 text-xs transition-all border duration-150 flex items-center gap-3 ${
                      selectedDonor?._id === d._id
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {d.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate">{d.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.mobile}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Profile */}
        <div className="lg:col-span-2">
          {!selectedDonor ? (
            <div className="card-theme h-full flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-2">
              <User size={40} className="text-slate-200" />
              <span className="font-semibold text-xs">देणगीदार निवडा आणि त्याचे संपूर्ण योगदान पहा.</span>
            </div>
          ) : profileLoading ? (
            <div className="card-theme h-full flex flex-col items-center justify-center py-20 text-center text-slate-400 animate-pulse">
              <span className="font-semibold text-xs">माहिती लोड होत आहे...</span>
            </div>
          ) : !donorProfile ? (
            <div className="card-theme h-full flex items-center justify-center py-20 text-center text-slate-400">
              <span className="font-semibold text-xs">प्रोफाईल लोड करण्यात अडचण आली.</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="card-theme space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-sm">
                      {donorProfile.donor.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">{donorProfile.donor.name}</h3>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                        <Smartphone size={12} />
                        <span>{donorProfile.donor.mobile}</span>
                        {donorProfile.donor.email && (
                          <>
                            <span>•</span>
                            <Mail size={12} />
                            <span>{donorProfile.donor.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">एकूण देणगी (Total Donated)</div>
                    <div className="text-base font-extrabold text-green-600 mt-1">₹{donorProfile.stats.totalDonated.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">पावत्या संख्या (Donations Count)</div>
                    <div className="text-base font-extrabold text-indigo-600 mt-1">{donorProfile.stats.count}</div>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">सरासरी देणगी (Average)</div>
                    <div className="text-base font-extrabold text-orange-600 mt-1">₹{Math.round(donorProfile.stats.avgDonation).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {donorProfile.donor.address && (
                  <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span><strong>पत्ता / Address:</strong> {donorProfile.donor.address}</span>
                  </div>
                )}
              </div>

              {/* Timeline list */}
              <div className="card-theme space-y-4">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                  <History size={15} className="text-indigo-600" />
                  <span>देणगी इतिहास / Donation History</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                        <th className="py-2.5">तारीख / Date</th>
                        <th className="py-2.5">उद्देश्य / Purpose</th>
                        <th className="py-2.5">भुगतान प्रकार / Mode</th>
                        <th className="py-2.5 text-right">रक्कम / Amount</th>
                        <th className="py-2.5">स्थिती / Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donorProfile.donations.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-400">इतिहास उपलब्ध नाही.</td>
                        </tr>
                      ) : (
                        donorProfile.donations.map((don) => (
                          <tr key={don._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 text-slate-500">{new Date(don.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 font-semibold text-slate-800">{don.purpose}</td>
                            <td className="py-3">
                              <span className="badge-info">{don.paymentMode}</span>
                            </td>
                            <td className="py-3 text-right font-extrabold text-slate-800">₹{don.amount.toLocaleString('en-IN')}</td>
                            <td className="py-3">
                              <span className={don.status === 'PAID' ? 'badge-success' : 'badge-danger'}>
                                {don.status}
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

    </div>
  );
};

export default Donors;
