import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import axios from 'axios';
import { Plus, CheckCircle, Clock, Heart, Users, ClipboardList, CheckSquare, Bookmark, X } from 'lucide-react';

const Volunteers = () => {
  const { activeFestivalId, role, hasPermission } = useApp();

  const [activeTab, setActiveTab] = useState('volunteers');
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for Volunteer registration
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('');
  const [department, setDepartment] = useState('Decoration');
  const [regError, setRegError] = useState('');

  // Form states for Task assignment
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskError, setTaskError] = useState('');

  const fetchVolunteersAndMembers = async () => {
    try {
      setLoading(true);
      const [vRes, mRes] = await [
        await axios.get('/volunteers'),
        await axios.get('/members'),
      ];
      setVolunteers(vRes.data);
      setMembers(mRes.data);
      if (mRes.data.length > 0) setSelectedMemberId(mRes.data[0]._id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/volunteers/tasks', { params: { festivalId: activeFestivalId } });
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'volunteers') {
      fetchVolunteersAndMembers();
    } else {
      fetchTasks();
      fetchVolunteersAndMembers(); // to get assignee list
    }
  }, [activeTab]);

  const handleRegisterVolunteer = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !department) {
      setRegError('Member and department are required');
      return;
    }

    try {
      await axios.post('/volunteers', {
        memberId: selectedMemberId,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        availability,
        department,
      });
      setRegisterModalOpen(false);
      clearRegForm();
      fetchVolunteersAndMembers();
    } catch (err) {
      setRegError(err.response?.data?.message || 'Error registering volunteer');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskAssignee) {
      setTaskError('Title and Assignee are required');
      return;
    }

    try {
      await axios.post('/volunteers/tasks', {
        title: taskTitle,
        description: taskDesc,
        assignedTo: taskAssignee,
        dueDate: taskDueDate || new Date(),
        festivalId: activeFestivalId,
      });
      setTaskModalOpen(false);
      clearTaskForm();
      fetchTasks();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateTaskStatus = async (id, status) => {
    try {
      await axios.put(`/volunteers/tasks/${id}/status`, { status });
      fetchTasks();
    } catch (e) {
      alert('Error updating task status');
    }
  };

  const handleLogHours = async (id) => {
    const hours = window.prompt('काम केलेले तास प्रविष्ट करा / Enter volunteer hours:');
    if (!hours || isNaN(hours)) return;
    try {
      await axios.put(`/volunteers/${id}/hours`, { hours });
      fetchVolunteersAndMembers();
    } catch (e) {
      alert('Error logging volunteer hours');
    }
  };

  const clearRegForm = () => {
    setSkills('');
    setAvailability('');
    setDepartment('Decoration');
    setRegError('');
  };

  const clearTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskAssignee('');
    setTaskDueDate('');
    setTaskError('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            कार्यकर्ते व स्वयंसेवक / Volunteer Operations
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            उत्सवातील विभागांचे व्यवस्थापन आणि कार्यकर्त्यांना कामांचे वाटप
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {hasPermission('volunteers:manage') && (
            activeTab === 'volunteers' ? (
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={15} />
                <span>स्वयंसेवक नोंदणी / Add Volunteer</span>
              </button>
            ) : (
              <button
                onClick={() => setTaskModalOpen(true)}
                className="btn-primary text-xs font-semibold py-2 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={15} />
                <span>नवीन काम वाटप / Assign Task</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'volunteers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Volunteers List (स्वयंसेवक यादी)
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'tasks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Task Allocations (कामांचे नियोजन)
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'volunteers' && (
        <div className="card-theme p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-3.5">नाव / Name</th>
                  <th className="px-6 py-3.5">विभाग / Department</th>
                  <th className="px-6 py-3.5">कौशल्ये / Skills</th>
                  <th className="px-6 py-3.5 font-semibold">उपलब्धता / Availability</th>
                  <th className="px-6 py-3.5 text-right">काम केलेले तास / Hours</th>
                  <th className="px-6 py-3.5 text-center">कृती / Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : volunteers.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No volunteers registered.</td></tr>
                ) : (
                  volunteers.map((v) => (
                    <tr key={v._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-850">{v.memberId?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{v.memberId?.mobile || ''}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="badge-info">{v.department}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {v.skills.map((s, idx) => (
                            <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-medium">{v.availability || 'N/A'}</td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-850">{v.hoursWorked} hrs</td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => handleLogHours(v._id)}
                          className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-650 cursor-pointer"
                        >
                          Log Hours
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">Loading Tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">No tasks allocated yet.</div>
          ) : (
            tasks.map((t) => {
              const isCompleted = t.status === 'COMPLETED';
              const isInProgress = t.status === 'IN_PROGRESS';
              return (
                <div key={t._id} className="card-theme space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-slate-800 line-clamp-2">{t.title}</span>
                      <span className={isCompleted ? 'badge-success' : isInProgress ? 'badge-info' : 'badge-warning'}>
                        {t.status}
                      </span>
                    </div>
                    {t.description && <p className="text-[11px] text-slate-400 leading-normal">{t.description}</p>}
                    <div className="text-[10px] text-slate-500 font-semibold pt-1">
                      Assigned to: {t.assignedTo?.memberId?.name || 'N/A'} ({t.assignedTo?.department})
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-4">
                    <span className="text-[10px] text-slate-400">
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </span>

                    {/* Quick status controls */}
                    <div className="flex gap-1">
                      {!isCompleted && (
                        <button
                          onClick={() => handleUpdateTaskStatus(t._id, 'COMPLETED')}
                          className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 font-bold text-[9px] hover:bg-green-100"
                        >
                          Complete
                        </button>
                      )}
                      {!isInProgress && !isCompleted && (
                        <button
                          onClick={() => handleUpdateTaskStatus(t._id, 'IN_PROGRESS')}
                          className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[9px] hover:bg-indigo-100"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- REGISTER VOLUNTEER MODAL --- */}
      {registerModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRegisterModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800">स्वयंसेवक नोंदणी / Register Volunteer</h2>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setRegisterModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={handleRegisterVolunteer}>
              {regError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">{regError}</div>}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">सदस्य निवडा / Select Member *</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white font-medium text-slate-700"
                >
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">विभाग / Assigned Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white font-medium"
                >
                  <option value="Decoration">Decoration (सजावट)</option>
                  <option value="Security">Security (सुरक्षा)</option>
                  <option value="Prasad">Prasad (प्रसाद)</option>
                  <option value="Traffic">Traffic (वाहतूक नियोजन)</option>
                  <option value="Cultural">Cultural (सांस्कृतिक)</option>
                  <option value="Social Work">Social Work (सामाजिक उपक्रम)</option>
                  <option value="Finance">Finance (आर्थिक)</option>
                  <option value="Digital">Digital / PR (सोशल मीडिया)</option>
                  <option value="Cleaning">Cleaning (स्वच्छता)</option>
                  <option value="Management">Management (व्यवस्थापन)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">कौशल्ये / Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="उदा. व्यवस्थापन, ड्रायव्हिंग, फोटोग्राफी"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">उपलब्धता / Availability</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="उदा. उत्सवाचे सर्व १० दिवस / फक्त संध्याकाळी"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer mt-6"
              >
                नोंदणी करा / Save Volunteer
              </button>
            </form>
          </div>
        </>
      )}

      {/* --- ASSIGN TASK MODAL --- */}
      {taskModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setTaskModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300">
            <div className="flex h-16 items-center justify-between border-b border-slate-50 px-6">
              <h2 className="text-sm font-bold text-slate-800">स्वयंसेवक काम वाटप / Assign Task</h2>
              <button className="p-1 rounded-md text-slate-400 hover:bg-slate-50" onClick={() => setTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={handleAssignTask}>
              {taskError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">{taskError}</div>}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">कामाचे शीर्षक / Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="उदा. मुख्य प्रवेशद्वार सुरक्षा रक्षक नियोजन"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">वर्णन / Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="कामाचे सविस्तर तपशील..."
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">कार्यकर्ता / Assign To *</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none bg-white font-medium text-slate-700"
                >
                  <option value="">कार्यकर्ता निवडा / Select Assignee</option>
                  {volunteers.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.memberId?.name} ({v.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">पूर्ण करण्याची अंतिम तारीख / Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 duration-100 cursor-pointer mt-6"
              >
                काम सोपवा / Save Task
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Volunteers;
