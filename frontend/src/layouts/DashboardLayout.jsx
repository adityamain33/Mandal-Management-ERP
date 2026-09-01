import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import {
  LayoutDashboard,
  Receipt,
  IndianRupee,
  Coins,
  BookOpen,
  Store,
  Users,
  HeartHandshake,
  Calendar,
  ClipboardList,
  FileBarChart2,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Plus,
  Activity,
} from 'lucide-react';

import { ROLE_LABELS } from '../utils/permissions.js';

const DashboardLayout = ({ children }) => {
  const {
    t,
    lang,
    changeLanguage,
    user,
    activeMandalName,
    activeFestivalYear,
    logoutUser,
    role,
    hasPermission,
    notifications,
    refreshNotifications,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // AI Chat states
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: t('ai.welcome') },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const navigationItems = [
    { name: t('sidebar.dashboard'), path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
    { name: t('sidebar.receipts'), path: '/receipts', icon: Receipt, permission: 'receipts:view' },
    { name: t('sidebar.donations'), path: '/donations', icon: IndianRupee, permission: 'donations:view' },
    { name: t('sidebar.expenses'), path: '/expenses', icon: Coins, permission: 'expenses:view' },
    { name: t('sidebar.accounting'), path: '/accounting', icon: BookOpen, permission: 'accounting:view' },
    { name: t('sidebar.vendors'), path: '/vendors', icon: Store, permission: 'vendors:view' },
    { name: t('sidebar.members'), path: '/members', icon: Users, permission: 'members:view' },
    { name: t('sidebar.donors'), path: '/donors', icon: Users, permission: 'donors:view' },
    { name: t('sidebar.volunteers'), path: '/volunteers', icon: HeartHandshake, permission: 'volunteers:view' },
    { name: t('sidebar.events'), path: '/events', icon: Calendar, permission: 'events:view' },
    { name: t('sidebar.reports'), path: '/reports', icon: FileBarChart2, permission: 'reports:view' },
    { name: t('sidebar.auditLogs'), path: '/audit-logs', icon: ClipboardList, permission: 'audit_logs:view' },
    { name: t('sidebar.settings'), path: '/settings', icon: SettingsIcon, permission: 'settings:view' },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleAskAi = async (questionText) => {
    const query = questionText || aiInput;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: query };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await axios.post('/ai/ask', { question: query });
      setAiMessages((prev) => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'क्षमस्व, मला आता उत्तर शोधता आले नाही. कृपया नंतर प्रयत्न करा.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const sampleQuestions = [
    'या महिन्यातील एकूण वर्गणी किती आहे?',
    'या वर्षी सर्वात जास्त देणगी कोणी दिली?',
    'आज किती receipts generate झाल्या?',
    'कोणत्या category मध्ये सर्वात जास्त खर्च झाला?',
  ];

  const roleLabel = ROLE_LABELS[role] ? (lang === 'en' ? ROLE_LABELS[role].en : ROLE_LABELS[role].mr) : role;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      
      {/* --- MOBILE SIDEBAR DRAWER OVERLAY --- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-50">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 shadow-md text-white font-bold text-lg">
              म
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                {t('title')}
              </span>
              <div className="text-[9px] text-slate-400 font-medium leading-none">
                Mandal Management ERP
              </div>
            </div>
          </Link>
          <button className="lg:hidden p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Mandal Badge Info */}
        <div className="mx-4 my-3 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 border border-indigo-100/20">
          <div className="font-semibold text-slate-800 text-sm truncate">{activeMandalName}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {activeFestivalYear || 'गणेशोत्सव २०२६'}
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navigationItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-slate-50 bg-white">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 bg-slate-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] font-bold text-orange-600 tracking-wide truncate">
                {roleLabel}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 cursor-pointer"
              title={t('sidebar.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-slate-100 bg-white shadow-sm">
          {/* Left Part */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            {/* Quick Status indicators (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                {t('header.statusOnline')}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 font-medium">
                {t('header.financialYear')}: 2026-2027
              </span>
            </div>
          </div>

          {/* Right Part Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                onClick={() => changeLanguage('mr')}
                className={`px-2 py-1 rounded-md font-semibold transition-all duration-150 ${
                  lang === 'mr' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="hidden sm:inline">मराठी</span>
                <span className="sm:hidden">म</span>
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded-md font-semibold transition-all duration-150 ${
                  lang === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-2 py-1 rounded-md font-semibold transition-all duration-150 ${
                  lang === 'hi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="hidden sm:inline">हिंदी</span>
                <span className="sm:hidden font-medium">हि</span>
              </button>
            </div>

            {/* Quick Add Actions */}
            {hasPermission('receipts:create') || hasPermission('donations:create') || hasPermission('expenses:create') || hasPermission('members:manage') || hasPermission('events:manage') || hasPermission('volunteers:manage') ? (
              <div className="relative">
                  <button
                    onClick={() => setQuickAddOpen(!quickAddOpen)}
                    className="flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold p-2 sm:px-3 sm:py-2 rounded-lg shadow-sm active:scale-95 duration-150 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline">{t('header.quickAdd')}</span>
                  </button>

                  {quickAddOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setQuickAddOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 z-20 origin-top-right rounded-lg bg-white p-1 border border-slate-100 shadow-lg ring-1 ring-black/5 focus:outline-none">
                        {hasPermission('receipts:create') && (
                          <Link
                            to="/receipts?action=create"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                            onClick={() => setQuickAddOpen(false)}
                          >
                            {t('header.newReceipt')}
                          </Link>
                        )}
                        {hasPermission('donations:create') && (
                          <Link
                            to="/donations?action=create"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                            onClick={() => setQuickAddOpen(false)}
                          >
                            {t('header.newDonation')}
                          </Link>
                        )}
                        {hasPermission('expenses:create') && (
                          <Link
                            to="/expenses?action=create"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                            onClick={() => setQuickAddOpen(false)}
                          >
                            {t('header.newExpense')}
                          </Link>
                        )}
                        {hasPermission('members:manage') && (
                          <Link
                            to="/members?action=create"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                            onClick={() => setQuickAddOpen(false)}
                          >
                            {t('header.newMember')}
                          </Link>
                        )}
                        {hasPermission('volunteers:manage') && (
                          <Link
                            to="/volunteers?action=create"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                            onClick={() => setQuickAddOpen(false)}
                          >
                            {t('header.newVolunteer')}
                          </Link>
                        )}
                        {hasPermission('events:manage') && (
                          <Link
                            to="/events?action=create"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-md"
                            onClick={() => setQuickAddOpen(false)}
                          >
                            {t('header.newEvent')}
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : null}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Bell size={16} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 z-20 origin-top-right rounded-xl bg-white border border-slate-100 shadow-xl ring-1 ring-black/5">
                    <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
                      <span className="font-bold text-xs text-slate-800">Notifications</span>
                      <span className="text-[10px] text-slate-400 font-bold">{notifications.length} Unread</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className="flex flex-col gap-0.5 rounded-lg p-2.5 text-left text-xs hover:bg-slate-50 border border-transparent hover:border-slate-100"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{n.title}</span>
                              <button
                                onClick={() => handleMarkRead(n._id)}
                                className="text-[9px] text-indigo-600 font-bold hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                            <span className="text-slate-500 leading-normal">{n.message}</span>
                            <span className="text-[8px] text-slate-400 mt-0.5">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* AI Toggle Button */}
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className="flex items-center justify-center gap-1 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold shadow-sm active:scale-95 duration-150 cursor-pointer"
            >
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">{t('header.askAi')}</span>
            </button>

          </div>
        </header>

        {/* --- DYNAMIC SUB PAGE ROUTE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* --- MANDAL AI ASSISTANT SLIDE PANEL --- */}
      {aiOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]" onClick={() => setAiOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-orange-600 animate-bounce" size={18} />
                <span className="font-bold text-slate-800 text-sm">
                  {t('sidebar.aiAssistant')}
                </span>
              </div>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setAiOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-orange-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-none bg-slate-100 border border-slate-200/50 px-4 py-2.5 text-xs text-slate-400">
                    विचार करत आहे (Calculating)...
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Chips */}
            <div className="p-3 border-t border-slate-50 bg-slate-50/50 space-y-2">
              <div className="text-[10px] text-slate-400 font-bold px-1">विचावून पहा (Try asking):</div>
              <div className="flex flex-wrap gap-1">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAskAi(q)}
                    className="text-[10px] bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 rounded-full px-2.5 py-1 text-left line-clamp-1 w-full truncate font-medium active:scale-95 duration-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="p-4 border-t border-slate-50 bg-white flex gap-2"
            >
              <input
                type="text"
                placeholder={t('ai.placeholder')}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={aiLoading}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
              >
                {t('ai.askButton')}
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default DashboardLayout;
