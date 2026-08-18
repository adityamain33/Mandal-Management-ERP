import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Table, History, Award, BookCopy, CreditCard, ChevronRight } from 'lucide-react';

const Accounting = () => {
  const [activeTab, setActiveTab] = useState('coa');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [trialBalance, setTrialBalance] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCOA = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/accounting/accounts');
      setAccounts(res.data);
      if (res.data.length > 0) setSelectedAccountId(res.data[0]._id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJournal = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/accounting/transactions');
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (accId) => {
    if (!accId) return;
    try {
      setLoading(true);
      const res = await axios.get('/accounting/ledger', { params: { accountId: accId } });
      setLedgerData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/accounting/balance-sheet');
      setTrialBalance(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'coa') fetchCOA();
    if (activeTab === 'journal') fetchJournal();
    if (activeTab === 'ledger') {
      fetchCOA();
    }
    if (activeTab === 'trial') fetchTrialBalance();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ledger' && selectedAccountId) {
      fetchLedger(selectedAccountId);
    }
  }, [selectedAccountId, activeTab]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          वित्तीय लेखा आणि बहीखाते / Accounting Ledger
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          द्विनोंद पद्धतीवर आधारित लेखांकन, खाते वह्या आणि चाचणी पत्रक
        </p>
      </div>

      {/* Tabs list switcher */}
      <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('coa')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'coa'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Chart of Accounts (खाते सूची)
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'journal'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Journal Entries (रोजनामचा नोंदी)
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'ledger'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General Ledger (खातेवही)
        </button>
        <button
          onClick={() => setActiveTab('trial')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'trial'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Trial Balance (चाचणी पत्रक)
        </button>
      </div>

      {/* --- TAB CONTENT AREA --- */}
      {activeTab === 'coa' && (
        <div className="card-theme p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-3.5">खाते कोड / Code</th>
                  <th className="px-6 py-3.5">खात्याचे नाव / Account Name</th>
                  <th className="px-6 py-3.5">खाते प्रकार / Account Type</th>
                  <th className="px-6 py-3.5">वर्णन / Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">No accounts generated.</td></tr>
                ) : (
                  accounts.map((a) => (
                    <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-800">{a.code}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">{a.name}</td>
                      <td className="px-6 py-3.5">
                        <span className="badge-info">{a.type}</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">{a.description || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-4">
          {loading ? (
            <div className="card-theme py-8 text-center text-xs text-slate-400 animate-pulse">Loading Journal...</div>
          ) : transactions.length === 0 ? (
            <div className="card-theme py-12 text-center text-xs text-slate-400">नोंदी आढळल्या नाहीत (No journal logs).</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx._id} className="card-theme space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-2">
                  <span className="font-bold text-xs text-slate-800">{tx.description}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Date: {new Date(tx.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-1">खाते नाव / Account</th>
                        <th className="py-1 text-right">नावे / Debit (Dr.)</th>
                        <th className="py-1 text-right">जमा / Credit (Cr.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tx.entries.map((entry, idx) => (
                        <tr key={idx} className="border-b border-slate-50/50 hover:bg-slate-50/20">
                          <td className="py-2 text-slate-700 font-medium">
                            {entry.type === 'CREDIT' ? <span className="pl-4">To {entry.accountId?.name}</span> : entry.accountId?.name}
                          </td>
                          <td className="py-2 text-right font-semibold text-slate-800">
                            {entry.type === 'DEBIT' ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2 text-right font-semibold text-slate-800">
                            {entry.type === 'CREDIT' ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Account Selector */}
          <div className="card-theme p-4 flex items-center gap-3 bg-white">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">खाते निवडा / Select Account:</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white font-semibold text-slate-700"
            >
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ledger table */}
          {loading ? (
            <div className="card-theme py-8 text-center text-xs text-slate-400 animate-pulse">Loading Ledger Lines...</div>
          ) : !ledgerData ? (
            <div className="card-theme py-8 text-center text-xs text-slate-400">Please select an account.</div>
          ) : (
            <div className="card-theme p-0 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-bold text-xs text-indigo-700">{ledgerData.account.name} Ledger Book</span>
                <span className="text-xs font-extrabold text-slate-750">
                  अंतिम शिल्लक (Balance): ₹{ledgerData.totals.finalBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase bg-slate-50/50">
                      <th className="px-6 py-2">तारीख / Date</th>
                      <th className="px-6 py-2">नोंद वर्णन / Description</th>
                      <th className="px-6 py-2 text-right">नावे / Debit (Dr)</th>
                      <th className="px-6 py-2 text-right">जमा / Credit (Cr)</th>
                      <th className="px-6 py-2 text-right">शिल्लक / Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.ledger.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">खातेवहीत नोंदी नाहीत.</td>
                      </tr>
                    ) : (
                      ledgerData.ledger.map((line, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30">
                          <td className="px-6 py-3.5 text-slate-400">{new Date(line.date).toLocaleDateString()}</td>
                          <td className="px-6 py-3.5 text-slate-700 font-medium">{line.description}</td>
                          <td className="px-6 py-3.5 text-right font-semibold text-green-600">
                            {line.type === 'DEBIT' ? `₹${line.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-red-600">
                            {line.type === 'CREDIT' ? `₹${line.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                            ₹{line.balance.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trial' && (
        <div className="card-theme p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-3.5">खाते कोड / Code</th>
                  <th className="px-6 py-3.5">नाव / Account Name</th>
                  <th className="px-6 py-3.5">वर्ग / Type</th>
                  <th className="px-6 py-3.5 text-right">एकूण नावे / Total Debit</th>
                  <th className="px-6 py-3.5 text-right">एकूण जमा / Total Credit</th>
                  <th className="px-6 py-3.5 text-right">शिल्लक रक्कम / Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading Balance Summary...</td></tr>
                ) : trialBalance.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No details compiled.</td></tr>
                ) : (
                  trialBalance.map((b) => (
                    <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-800">{b.code}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">{b.name}</td>
                      <td className="px-6 py-3.5 text-slate-500">{b.type}</td>
                      <td className="px-6 py-3.5 text-right text-slate-700">₹{b.debits.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-right text-slate-700">₹{b.credits.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">
                        ₹{b.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Accounting;
