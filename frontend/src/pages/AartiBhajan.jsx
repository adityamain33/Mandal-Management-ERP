import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { aartiPdfBooks } from '../data/aartiBhajanData.js';
import {
  Flame,
  Search,
  BookOpen,
  Download,
  Share2,
  Printer,
  Maximize2,
  Minimize2,
  Volume2,
  Upload,
  FileText,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Users,
} from 'lucide-react';

const AartiBhajan = () => {
  const { user, role, hasPermission } = useApp();
  const isAdminOrManager = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'PRESIDENT' || role === 'SECRETARY' || hasPermission('settings:manage');

  const [mandalAartis, setMandalAartis] = useState([]);
  const [loadingMandalAartis, setLoadingMandalAartis] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(aartiPdfBooks[0].id);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [autoScroll, setAutoScroll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Upload Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDeity, setUploadDeity] = useState('श्री गणेश');
  const [uploadCategory, setUploadCategory] = useState('ganesh');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const viewerContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioContextRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch saved Mandal Aarti PDFs from backend
  const fetchMandalAartis = async () => {
    try {
      setLoadingMandalAartis(true);
      const res = await axios.get('/aartis');
      if (res.data.success) {
        setMandalAartis(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching Mandal Aarti PDFs:', err);
    } finally {
      setLoadingMandalAartis(false);
    }
  };

  useEffect(() => {
    fetchMandalAartis();
  }, []);

  // Determine current active book/document
  const currentMandalPdf = mandalAartis.find((m) => String(m.id) === String(selectedBookId));
  const currentBuiltinBook = aartiPdfBooks.find((b) => b.id === selectedBookId);

  const selectedBook = currentMandalPdf
    ? {
        id: String(currentMandalPdf.id),
        title: currentMandalPdf.title,
        category: currentMandalPdf.category || 'all',
        categoryLabel: currentMandalPdf.categoryLabel || 'मंडळ PDF',
        deity: currentMandalPdf.deity || 'सर्व देवता',
        pagesCount: currentMandalPdf.pagesCount || 'PDF',
        size: currentMandalPdf.fileSize || '1.0 MB',
        themeColor: '#ea580c',
        description: currentMandalPdf.description || 'मंडळाने सेव्ह केलेली अधिकृत आरती व भजन PDF पुस्तिका.',
        isServerPdf: true,
        pdfUrl: currentMandalPdf.filePath,
        fullPdfUrl: `${backendUrl}${currentMandalPdf.filePath}`,
        uploader: currentMandalPdf.uploader?.name || 'Admin',
        createdAt: currentMandalPdf.createdAt,
      }
    : currentBuiltinBook || aartiPdfBooks[0];

  // Synthesize Bell Sound
  const playBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const freqs = [1046.5, 2093.0, 3135.96, 4186.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const decay = 2.5 - idx * 0.4;
        gain.gain.setValueAtTime(0.3 / (idx + 1), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + decay);
      });
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  // Synthesize Conch / Shankh Sound
  const playConchSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 1.2);
      osc.frequency.exponentialRampToValueAtTime(270, ctx.currentTime + 2.8);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    } catch (e) {
      console.log('Audio error', e);
    }
  };

  // Auto-scroll effect for readable pages
  useEffect(() => {
    let interval;
    if (autoScroll && viewerContainerRef.current) {
      interval = setInterval(() => {
        if (viewerContainerRef.current) {
          viewerContainerRef.current.scrollTop += 1.5;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [autoScroll]);

  // Handle File Selection to open Upload Modal
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('कृपया फक्त PDF फाइल निवडा (.pdf)');
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
    setUploadDescription('मंडळासाठी अधिकृत आरती व भजन संग्रह पुस्तिका.');
    setUploadModalOpen(true);
  };

  // Handle Form Submit (Save PDF to Backend)
  const handleSavePdfToServer = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('pdf', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('deity', uploadDeity);
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription.trim());

      const catLabels = {
        ganesh: 'गणेशोत्सव',
        devi: 'देवी / नवरात्र',
        vitthal: 'विठ्ठल / भजने',
        datta: 'दत्त व शंकर',
        prarthana: 'काकड / पसायदान',
        custom: 'मंडळ विशेष',
      };
      formData.append('categoryLabel', catLabels[uploadCategory] || 'मंडळ PDF');

      const res = await axios.post('/aartis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUploadSuccessMsg('PDF यशस्वीरित्या सेव्ह झाली! आता सर्व सदस्यांना दिसेल.');
        await fetchMandalAartis();
        setSelectedBookId(String(res.data.data.id));
        setTimeout(() => {
          setUploadModalOpen(false);
          setUploadSuccessMsg('');
          setUploadFile(null);
        }, 1200);
      }
    } catch (err) {
      console.error('Error saving PDF:', err);
      alert(err.response?.data?.message || 'PDF सेव्ह करताना त्रुटी आली.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Delete Aarti PDF (Admin only)
  const handleDeleteAarti = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('तुम्हाला खात्री आहे का ही PDF हटवायची आहे?')) return;

    try {
      const res = await axios.delete(`/aartis/${id}`);
      if (res.data.success) {
        if (String(selectedBookId) === String(id)) {
          setSelectedBookId(aartiPdfBooks[0].id);
        }
        fetchMandalAartis();
      }
    } catch (err) {
      console.error('Error deleting PDF:', err);
      alert('PDF हटवताना त्रुटी आली.');
    }
  };

  // Filter books
  const filteredMandalAartis = mandalAartis.filter((book) => {
    const matchesCategory =
      selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.deity && book.deity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredBuiltinBooks = aartiPdfBooks.filter((book) => {
    const matchesCategory =
      selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Handle WhatsApp Share
  const handleShare = () => {
    const text = `🪔 *${selectedBook.title}* 🪔\n\nमंडळ सेतू आरती व भजन PDF संग्रह:\n${selectedBook.description}\n\nवाचण्यासाठी भेट द्या: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Handle Print
  const handlePrint = () => {
    if (selectedBook.isServerPdf && selectedBook.pdfUrl) {
      window.open(selectedBook.pdfUrl, '_blank');
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP SPIRITUAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-100 border border-white/20">
              <Flame size={14} className="text-amber-300 animate-pulse" />
              <span>पवित्र आरती व भजन PDF संग्रह (Aarti PDF Books)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-xs">
              आरती व भजने (Aarti & Bhajan PDF Sangrah)
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              मंडळाच्या आरतीच्या वेळी सर्व सदस्यांसाठी सहज वाचण्यासाठी, मोठ्या स्क्रीनवर दाखवण्यासाठी आणि मंडळाची स्वतःची PDF सेव्ह करण्यासाठी अधिकृत मराठी संग्रह.
            </p>
          </div>

          {/* Sound & Audio Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={playBellSound}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition backdrop-blur-md border border-white/20 text-white font-bold text-xs shadow-xs"
              title="घंटी वाजवा"
            >
              <span className="text-lg">🔔</span>
              <span>घंटी नाद (Bell)</span>
            </button>

            <button
              onClick={playConchSound}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition backdrop-blur-md border border-white/20 text-white font-bold text-xs shadow-xs"
              title="शंख फुंका"
            >
              <span className="text-lg">🐚</span>
              <span>शंख नाद (Conch)</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Background Glows */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-red-800/30 blur-3xl pointer-events-none" />
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PDF Collection & Search (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="आरती, भजन किंवा स्तोत्र PDF शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 shadow-xs transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'सर्व PDFs' },
              { id: 'ganesh', label: 'गणेशोत्सव' },
              { id: 'devi', label: 'देवी / नवरात्र' },
              { id: 'vitthal', label: 'विठ्ठल / भजने' },
              { id: 'datta', label: 'दत्त व शंकर' },
              { id: 'prarthana', label: 'काकड / पसायदान' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Upload & Save Custom PDF Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilePicked}
            accept="application/pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-2 border-dashed border-orange-300 text-orange-900 font-bold text-xs transition active:scale-[0.99] shadow-xs"
          >
            <Upload size={16} className="text-orange-600" />
            <span>+ मंडळाची PDF अपलोड व सेव्ह करा (Save PDF)</span>
          </button>

          {/* PDF Books List */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            
            {/* Section A: MANDAL SAVED PDFs (Visible to All Members) */}
            {filteredMandalAartis.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span className="flex items-center gap-1.5 text-orange-700">
                    <Users size={14} />
                    <span>मंडळाने सेव्ह केलेल्या PDFs ({filteredMandalAartis.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">सर्व सदस्यांना दृश्य</span>
                </div>

                {filteredMandalAartis.map((book) => {
                  const isSelected = String(selectedBookId) === String(book.id);
                  return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBookId(String(book.id))}
                      className={`p-4 rounded-2xl border transition cursor-pointer text-left relative group ${
                        isSelected
                          ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                          : 'bg-white border-amber-200/80 hover:border-orange-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                            <span>✨</span>
                            <span>{book.categoryLabel || 'मंडळ PDF'}</span>
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {book.deity}
                          </span>
                        </div>

                        {/* Admin Delete Action */}
                        {isAdminOrManager && (
                          <button
                            onClick={(e) => handleDeleteAarti(e, book.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                            title="ही PDF कायमची हटवा"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <h3 className={`font-bold text-xs sm:text-sm mt-2 transition ${isSelected ? 'text-orange-900' : 'text-slate-800'}`}>
                        {book.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {book.description || 'मंडळाची अधिकृत आरती पुस्तिका.'}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                        <span>अपलोड: {book.uploader?.name || 'Admin'} • {book.fileSize}</span>
                        <span className="text-orange-600 font-bold flex items-center gap-1">
                          <span>PDF पहा</span>
                          <span>➔</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section B: BUILT-IN SPIRITUAL AARTI PDF BOOKS */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700 px-1 pt-2 border-t border-slate-100">
                <span>नित्य आरती व भजन संग्रह (Official Books)</span>
              </div>

              {filteredBuiltinBooks.map((book) => {
                const isSelected = selectedBookId === book.id && !currentMandalPdf;
                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {book.categoryLabel}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {book.deity}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-200">
                        📄 {book.pagesCount} पाने
                      </span>
                    </div>

                    <h3 className={`font-bold text-xs sm:text-sm mt-2 transition ${isSelected ? 'text-orange-900' : 'text-slate-800'}`}>
                      {book.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {book.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      <span>आकार: {book.size}</span>
                      <span className="text-orange-600 font-bold flex items-center gap-1">
                        <span>PDF वाचा</span>
                        <span>➔</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMandalAartis.length === 0 && filteredBuiltinBooks.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
                कोणतीही आरती किंवा भजन PDF सापडली नाही.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-DEFINITION PDF READER & TOOLBAR (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Top Viewer Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                🪔
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {selectedBook.title}
                </h2>
                <p className="text-[10px] text-slate-400 truncate">
                  {selectedBook.deity} • {selectedBook.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Zoom Controls */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 text-slate-700">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 transition"
                  title="झूम कमी करा"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="px-2 text-[10px] font-bold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 transition"
                  title="झूम वाढवा"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Auto Scroll (for native pages) */}
              {!selectedBook.isServerPdf && (
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    autoScroll
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="आरती म्हणताना आपोआप स्क्रोल करा"
                >
                  <span>📜</span>
                  <span>{autoScroll ? 'स्क्रोल थांबवा' : 'ऑटो-स्क्रोल'}</span>
                </button>
              )}

              {/* Open in New Tab (for server PDF) */}
              {selectedBook.isServerPdf && selectedBook.pdfUrl && (
                <a
                  href={selectedBook.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
                  title="नवीन टॅबमध्ये उघडा"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">नवीन टॅब</span>
                </a>
              )}

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
                title="प्रिंट काढा (Print PDF)"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">प्रिंट</span>
              </button>

              {/* WhatsApp Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition"
                title="व्हॉट्सॲपवर पाठवा"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">शेअर</span>
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs transition"
                title="पूर्ण पडदा (Fullscreen)"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* MAIN PDF VIEWER / DOCUMENT DISPLAY CANVAS */}
          <div
            ref={viewerContainerRef}
            className="rounded-3xl border border-slate-200 bg-slate-900/5 p-4 sm:p-6 min-h-[640px] max-h-[750px] overflow-y-auto shadow-inner relative"
          >
            {/* If Mandal Saved Server PDF */}
            {selectedBook.isServerPdf && selectedBook.pdfUrl ? (
              <div className="w-full h-full min-h-[640px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <object
                  data={`${selectedBook.pdfUrl}#toolbar=1&navpanes=0`}
                  type="application/pdf"
                  className="w-full h-[640px]"
                >
                  <iframe
                    src={`${selectedBook.pdfUrl}#toolbar=1&navpanes=0`}
                    title={selectedBook.title}
                    className="w-full h-[640px] border-0"
                  >
                    <div className="p-8 text-center space-y-3">
                      <p className="text-slate-600 text-sm">ब्राऊझरमध्ये थेट PDF उघडण्यासाठी खाली क्लिक करा:</p>
                      <a
                        href={selectedBook.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-xs"
                      >
                        📄 PDF उघडा
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            ) : (
              /* Built-in Authentic Aarti PDF Book Engine */
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="space-y-8 transition-transform duration-200 max-w-2xl mx-auto"
              >
                {selectedBook.pages?.map((page, idx) => (
                  <div
                    key={page.pageNumber}
                    className="relative bg-[#fffdfa] rounded-2xl border-2 border-amber-300/80 shadow-md p-6 sm:p-10 text-slate-900 overflow-hidden print:shadow-none print:border-0 print:p-0"
                  >
                    {/* Golden Ornamental Inner Border */}
                    <div className="absolute inset-2 border border-dashed border-amber-400/50 rounded-xl pointer-events-none" />

                    {/* Page Header */}
                    <div className="text-center pb-4 border-b border-amber-200 relative z-10 space-y-1">
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-700">
                        <span>🕉️</span>
                        <span>{selectedBook.title}</span>
                        <span>🕉️</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                        {page.title}
                      </h2>
                      {page.rushi && (
                        <p className="text-[11px] font-medium text-amber-800">
                          {page.rushi}
                        </p>
                      )}
                    </div>

                    {/* Page Content / Aarti Slokas */}
                    <div className="py-6 text-center relative z-10">
                      <pre className="font-serif text-sm sm:text-base leading-loose sm:leading-[2.2] text-slate-800 whitespace-pre-wrap font-semibold tracking-wide select-text">
                        {page.content}
                      </pre>
                    </div>

                    {/* Page Footer */}
                    <div className="pt-4 border-t border-amber-200 flex items-center justify-between text-[10px] text-slate-400 font-medium relative z-10">
                      <span>मंडळ सेतू • आरती संग्रह</span>
                      <span className="font-bold text-orange-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        पान {page.pageNumber} / {selectedBook.pages?.length || 1}
                      </span>
                      <span>सर्व हक्क राखीव</span>
                    </div>

                    {/* Subtle Corner Florals */}
                    <span className="absolute top-3 left-3 text-xs text-amber-400 opacity-60">🪷</span>
                    <span className="absolute top-3 right-3 text-xs text-amber-400 opacity-60">🪷</span>
                    <span className="absolute bottom-3 left-3 text-xs text-amber-400 opacity-60">🪷</span>
                    <span className="absolute bottom-3 right-3 text-xs text-amber-400 opacity-60">🪷</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info & Print Help */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-orange-600 font-bold">💡 माहिती:</span>
              <span>मंडळाने सेव्ह केलेली कोणतीही PDF सर्व सभासदांना (Members) त्यांच्या खात्यातून लगेच उपलब्ध होते.</span>
            </div>
            <button
              onClick={handlePrint}
              className="font-bold text-orange-600 hover:underline shrink-0 flex items-center gap-1"
            >
              <span>🖨️ मुद्रण (Print) करा</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. UPLOAD & SAVE PDF MODAL (Admin / Manager) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Close Button */}
            <button
              onClick={() => !uploading && setUploadModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              disabled={uploading}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                📄
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  मंडळासाठी आरती PDF सेव्ह करा
                </h3>
                <p className="text-xs text-slate-400">
                  ही PDF सेव्ह केल्यानंतर मंडळाच्या सर्व सदस्यांना व अधिकाऱ्यांना दिसेल.
                </p>
              </div>
            </div>

            {uploadSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 animate-bounce" />
                <h4 className="font-bold text-sm text-slate-800">{uploadSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleSavePdfToServer} className="space-y-4">
                
                {/* Selected File Info */}
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-orange-600 shrink-0" />
                    <span className="font-bold text-orange-950 truncate">{uploadFile?.name}</span>
                  </div>
                  <span className="text-[11px] text-orange-700 font-medium shrink-0">
                    {uploadFile ? (uploadFile.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}
                  </span>
                </div>

                {/* PDF Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    आरती पुस्तिकेचे नाव (PDF Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="उदा. श्री गणेशोत्सव २०२६ महाआरती संग्रह"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {/* Deity & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      देवता (Deity)
                    </label>
                    <input
                      type="text"
                      value={uploadDeity}
                      onChange={(e) => setUploadDeity(e.target.value)}
                      placeholder="उदा. श्री गणेश, विठ्ठल, देवी"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      प्रवर्ग (Category)
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="ganesh">गणेशोत्सव</option>
                      <option value="devi">देवी / नवरात्र</option>
                      <option value="vitthal">विठ्ठल / भजने</option>
                      <option value="datta">दत्त व शंकर</option>
                      <option value="prarthana">काकड / पसायदान</option>
                      <option value="custom">मंडळ विशेष / इतर</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    वर्णन किंवा माहिती (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="उदा. मंडळाची अधिकृत आरती पुस्तिका व भजने."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    रद्द करा
                  </button>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>सेव्ह होत आहे...</span>
                      </>
                    ) : (
                      <>
                        <span>💾 सर्व सदस्यांसाठी सेव्ह करा</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AartiBhajan;
