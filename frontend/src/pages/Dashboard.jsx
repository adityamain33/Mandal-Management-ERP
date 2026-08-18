import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  IndianRupee,
} from 'lucide-react';

const COLORS = ['#6366f1', '#ea580c', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

const Dashboard = () => {
  const { t, lang } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeletons */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-slate-100 p-6 animate-pulse">
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-4"></div>
              <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 rounded-xl bg-white border border-slate-100 p-6 animate-pulse"></div>
          <div className="h-80 rounded-xl bg-white border border-slate-100 p-6 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalDonations: 0,
    totalExpenses: 0,
    balance: 0,
    todayCollection: 0,
    monthlyCollection: 0,
    donorsCount: 0,
    receiptsCount: 0,
  };

  const charts = stats?.charts || {
    paymentMode: [],
    purpose: [],
    expenseCategory: [],
    trend: [],
  };

  const recent = stats?.recent || {
    donations: [],
    expenses: [],
    events: [],
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            डॅशबोर्ड / Dashboard
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            मंडळाचे आर्थिक आणि संघटनात्मक विहंगावलोकन
          </p>
        </div>
      </div>

      {/* --- STATISTICS CARDS --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Collections */}
        <div className="card-theme border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.collection')}</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">₹{summary.totalDonations.toLocaleString('en-IN')}</h3>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600 border border-green-100">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-green-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={14} />
              ₹{summary.todayCollection.toLocaleString('en-IN')}
            </span>
            <span>आज जमा (Today)</span>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="card-theme border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.expenses')}</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">₹{summary.totalExpenses.toLocaleString('en-IN')}</h3>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600 border border-red-100">
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-slate-400 font-bold">या महिन्यातील जमा:</span>
            <span className="text-slate-700 font-bold">₹{summary.monthlyCollection.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 3: Balance */}
        <div className="card-theme border-l-4 border-l-indigo-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.balance')}</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">₹{summary.balance.toLocaleString('en-IN')}</h3>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 border border-indigo-100">
              <Wallet size={22} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-slate-400 font-bold">एकूण पावत्या:</span>
            <span className="text-indigo-600 font-bold">{summary.receiptsCount}</span>
          </div>
        </div>

        {/* Card 4: Donors */}
        <div className="card-theme border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.donors')}</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{summary.donorsCount}</h3>
            </div>
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600 border border-orange-100">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-orange-600 font-bold flex items-center">
              <IndianRupee size={12} />
              {(summary.donorsCount > 0 ? Math.round(summary.totalDonations / summary.donorsCount) : 0).toLocaleString('en-IN')}
            </span>
            <span>सरासरी देणगी (Avg/Donor)</span>
          </div>
        </div>

      </div>

      {/* --- CHARTS GRID --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Chart 1: Income vs Expense Trend */}
        <div className="card-theme lg:col-span-2 flex flex-col h-96">
          <h4 className="font-bold text-sm text-slate-700 mb-4">{t('dashboard.chartTrend')}</h4>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.trend}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey={lang === 'mr' ? 'monthMarathi' : 'month'} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="जमा" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                <Area type="monotone" dataKey="खर्च" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Mode splits */}
        <div className="card-theme flex flex-col h-96">
          <h4 className="font-bold text-sm text-slate-700 mb-4">{t('dashboard.chartPaymentMode')}</h4>
          {charts.paymentMode.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">माहिती उपलब्ध नाही (No Data)</div>
          ) : (
            <div className="flex-1 w-full text-xs relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.paymentMode}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.paymentMode.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* --- RECENT DATA TABLES --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Table 1: Recent Donations */}
        <div className="card-theme lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-700">{t('dashboard.recentDonations')}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5">देणगीदार / Donor</th>
                  <th className="py-2.5 text-right">रक्कम / Amount</th>
                  <th className="py-2.5">हेतू / Purpose</th>
                  <th className="py-2.5">पेमेंट / Mode</th>
                </tr>
              </thead>
              <tbody>
                {recent.donations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400">कोणतीही देणगी मिळालेली नाही.</td>
                  </tr>
                ) : (
                  recent.donations.map((d) => (
                    <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-800">{d.donorId?.name || 'Unknown'}</td>
                      <td className="py-3 text-right font-extrabold text-green-600">₹{d.amount}</td>
                      <td className="py-3 text-slate-500">{d.purpose}</td>
                      <td className="py-3">
                        <span className="badge-info">{d.paymentMode}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Upcoming Events */}
        <div className="card-theme space-y-4">
          <h4 className="font-bold text-sm text-slate-700">{t('dashboard.upcomingEvents')}</h4>
          <div className="space-y-3">
            {recent.events.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">आगामी कार्यक्रम नियोजित नाहीत.</div>
            ) : (
              recent.events.map((e) => (
                <div key={e._id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 font-bold text-xs shrink-0">
                    <div>{new Date(e.date).getDate()}</div>
                    <div className="text-[9px] uppercase">{new Date(e.date).toLocaleString('en-US', { month: 'short' })}</div>
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 truncate leading-snug">{e.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className="font-medium">{e.startTime} वाजता</span>
                      <span>•</span>
                      <span className="truncate">{e.location || 'मुख्य मंडप'}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
