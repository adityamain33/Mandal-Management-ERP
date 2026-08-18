import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, ShieldAlert, User, Clock } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/audit-logs');
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          ऑडिट लॉग्स / Audit Trails
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          मंडळामध्ये झालेल्या सर्व आर्थिक आणि व्यवस्थापकीय कृतींची पारदर्शक नोंद (Financial transparency logs)
        </p>
      </div>

      {/* Logs Table */}
      <div className="card-theme p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <th className="px-6 py-3.5">तारीख आणि वेळ / Timestamp</th>
                <th className="px-6 py-3.5">वापरकर्ता / User</th>
                <th className="px-6 py-3.5">कृती / Action</th>
                <th className="px-6 py-3.5">विभाग / Module</th>
                <th className="px-6 py-3.5">आयपी पत्ता / IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading audit log trails...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    पारदर्शक ऑडिट नोंदी उपलब्ध नाहीत.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} />
                      <span>{new Date(l.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-800">{l.userId?.name || 'System / Auto'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{l.userId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      {l.description}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="badge-info">{l.module}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 font-medium">
                      {l.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AuditLogs;
