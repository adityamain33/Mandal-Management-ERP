import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileBarChart2, FileSpreadsheet, Download, RefreshCw, BarChart } from 'lucide-react';

const Reports = () => {
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/reports/profit-loss');
      setProfitLoss(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const handleExport = (reportType, format) => {
    window.open(`${axios.defaults.baseURL}/reports/${reportType}/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            अहवाल आणि निर्यात / Reports & Export Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            मंडळाचे आर्थिक विश्लेषण आणि एक्सेल/सीएसव्ही फॉरमॅटमध्ये माहिती निर्यात
          </p>
        </div>
        <button
          onClick={fetchProfitLoss}
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="card-theme py-12 text-center text-xs text-slate-400 animate-pulse">Loading Financial Analytics...</div>
      ) : !profitLoss ? (
        <div className="card-theme py-12 text-center text-xs text-slate-400">Error loading report.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block: Income & Expense Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-theme space-y-4">
              <h3 className="font-bold text-xs text-slate-800 border-b border-slate-50 pb-2">नफा-तोटा पत्रक / Income Statement</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">एकूण जमा (Total Income):</span>
                  <span className="font-extrabold text-green-600">₹{profitLoss.summary.totalIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">एकूण खर्च (Total Expenses):</span>
                  <span className="font-extrabold text-red-650">₹{profitLoss.summary.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-50 pt-2 flex items-center justify-between font-bold text-slate-850">
                  <span>निव्वळ शिल्लक / Net Surplus:</span>
                  <span className={profitLoss.summary.netSurplus >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ₹{profitLoss.summary.netSurplus.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Downloader tools */}
            <div className="card-theme space-y-4">
              <h3 className="font-bold text-xs text-slate-800 border-b border-slate-50 pb-2">माहिती डाउनलोड करा / Data Exports</h3>
              
              <div className="space-y-3.5">
                {/* Receipts */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-slate-700">पावत्या अहवाल (Receipts)</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleExport('receipts', 'xlsx')}
                      className="p-1.5 rounded bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-[10px] font-bold"
                    >
                      XLSX
                    </button>
                    <button
                      onClick={() => handleExport('receipts', 'csv')}
                      className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100 text-[10px] font-bold"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Donations */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-slate-700">देणगी नोंदी (Donations)</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleExport('donations', 'xlsx')}
                      className="p-1.5 rounded bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-[10px] font-bold"
                    >
                      XLSX
                    </button>
                    <button
                      onClick={() => handleExport('donations', 'csv')}
                      className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100 text-[10px] font-bold"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Expenses */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-slate-700">खर्च नोंदी (Expenses)</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleExport('expenses', 'xlsx')}
                      className="p-1.5 rounded bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 text-[10px] font-bold"
                    >
                      XLSX
                    </button>
                    <button
                      onClick={() => handleExport('expenses', 'csv')}
                      className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100 text-[10px] font-bold"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Breakdowns */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Income Breakdowns */}
            <div className="card-theme space-y-4">
              <h3 className="font-bold text-xs text-slate-800 border-b border-slate-50 pb-2">वर्गणी प्रकार वर्गीकरण / Income Breakdown</h3>
              <div className="space-y-3">
                {profitLoss.incomeDetails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">माहिती नाही</div>
                ) : (
                  profitLoss.incomeDetails.map((inc, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">{inc.purpose}</span>
                      <span className="font-extrabold text-slate-800">₹{inc.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expense Breakdowns */}
            <div className="card-theme space-y-4">
              <h3 className="font-bold text-xs text-slate-800 border-b border-slate-50 pb-2">खर्च वर्गवारी वर्गीकरण / Expense Breakdown</h3>
              <div className="space-y-3">
                {profitLoss.expenseDetails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">माहिती नाही</div>
                ) : (
                  profitLoss.expenseDetails.map((exp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">{exp.category}</span>
                      <span className="font-extrabold text-slate-800">₹{exp.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Reports;
