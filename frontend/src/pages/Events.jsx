import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Plus, Calendar, Clock, MapPin, User, Trash2, HeartHandshake, CheckCircle, X } from 'lucide-react';

const Events = () => {
  const { activeFestivalId, role, hasPermission } = useApp();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchEventsAndMembers = async () => {
    try {
      setLoading(true);
      const [eRes, mRes] = await [
        await axios.get('/events', { params: { festivalId: activeFestivalId } }),
        await axios.get('/members'),
      ];

      setEvents(eRes.data);
      setMembers(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date || !startTime) {
      setFormError('Name, Date, and Start Time are required');
      return;
    }

    try {
      await axios.post('/events', {
        name,
        date,
        startTime,
        endTime,
        location,
        description,
        budget,
        coordinatorId: coordinatorId || null,
        festivalId: activeFestivalId,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setModalOpen(false);
        clearForm();
        fetchEventsAndMembers();
      }, 1500);

    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्हाला खरोखर हा कार्यक्रम हटवायचा आहे का?')) return;
    try {
      await axios.delete(`/events/${id}`);
      fetchEventsAndMembers();
    } catch (e) {
      alert('कार्यक्रम हटवण्यात अडचण आली.');
    }
  };

  const clearForm = () => {
    setName('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setDescription('');
    setBudget('');
    setCoordinatorId('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            उत्सव कार्यक्रम सूची / Festival Events
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            गणेशोत्सवातील विविध धार्मिक, सामाजिक आणि सांस्कृतिक कार्यक्रमांचे वेळापत्रक
          </p>
        </div>

        {hasPermission('events:manage') && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 self-start cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>नवीन कार्यक्रम / Add Event</span>
          </button>
        )}
      </div>

      {/* Events timeline lists */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-theme py-8 text-center text-xs text-slate-400 animate-pulse">Loading Events...</div>
        ) : events.length === 0 ? (
          <div className="card-theme py-12 text-center text-xs text-slate-400">
            कोणतेही कार्यक्रम नियोजित नाहीत (No events scheduled).
          </div>
        ) : (
          events.map((e) => (
            <div key={e._id} className="card-theme flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:shadow-md transition-shadow">
              
              {/* Date Block */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 text-orange-700 font-bold shrink-0">
                  <div className="text-lg">{new Date(e.date).getDate()}</div>
                  <div className="text-[9px] uppercase font-bold">{new Date(e.date).toLocaleString('en-US', { month: 'short' })}</div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-800 text-xs leading-snug">{e.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 max-w-xl">{e.description}</p>
                </div>
              </div>

              {/* Time & Location Metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{e.startTime} {e.endTime ? `to ${e.endTime}` : ''}</span>
                </div>
                {e.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{e.location}</span>
                  </div>
                )}
                {e.coordinatorId && (
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    <span>Coord: {e.coordinatorId.name}</span>
                  </div>
                )}
              </div>

              {/* Budget & Actions */}
              <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                {e.budget > 0 && (
                  <div className="text-xs">
                    <span className="text-slate-400">Budget:</span> <span className="font-bold text-slate-700">₹{e.budget.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <span className="badge-success">{e.status}</span>
                
                {hasPermission('events:manage') && (
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50 cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* --- FORM MODAL --- */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800">नवीन कार्यक्रम जोडा / Register Event</h2>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={handleSubmit}>
              {formError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">{formError}</div>}
              {formSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>कार्यक्रम यशस्वीरित्या जोडला गेला!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">कार्यक्रमाचे नाव / Event Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. आरती, महाप्रसाद, सांस्कृतिक कार्यक्रम"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">वर्णन / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="कार्यक्रमाचे तपशील..."
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">तारीख / Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">अंदाजित खर्च / Event Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="उदा. 5000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">सुरुवात वेळ / Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">समाप्ती वेळ / End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">स्थान / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="उदा. मुख्य मंडप"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">समन्वयक / Coordinator</label>
                  <select
                    value={coordinatorId}
                    onChange={(e) => setCoordinatorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white font-medium text-slate-700"
                  >
                    <option value="">समन्वयक निवडा / Select Coordinator</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer mt-6"
              >
                कार्यक्रम जतन करा / Save Event
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Events;
