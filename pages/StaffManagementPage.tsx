
import React, { useState, useEffect } from 'react';
import { Page, CleaningTask, Cleaner, TaskStatus } from '../types';
import { db } from '../db';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  Plus, 
  Phone, 
  Trash2, 
  Calendar, 
  Zap, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  X,
  Clock,
  Briefcase,
  TrendingUp
} from 'lucide-react';

interface StaffManagementPageProps {
  onNavigate: (page: Page) => void;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ onNavigate }) => {
  const [staff, setStaff] = useState<Cleaner[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'lead' as any, phone: '' });

  const loadData = async () => {
    const [dbTasks, dbStaff] = await Promise.all([db.getTasks(), db.getStaff()]);
    setTasks(dbTasks);
    setStaff(dbStaff);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaner: Cleaner = {
      id: `STF-${Date.now()}`,
      name: newStaff.name,
      role: newStaff.role,
      phone: newStaff.phone,
      status: 'active',
      joinedAt: new Date().toISOString()
    };
    await db.saveStaff(cleaner);
    setShowAddModal(false);
    setNewStaff({ name: '', role: 'lead', phone: '' });
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm("Remove this personnel from the active fleet?")) {
      await db.deleteStaff(id);
    }
  };

  const handleAssignTask = async (taskId: string, cleanerName: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await db.saveTask({ ...task, cleanerName, status: 'in-progress' as TaskStatus });
    }
  };

  const getWorkload = (cleanerName: string) => {
    return tasks.filter(t => t.cleanerName === cleanerName && t.status !== 'completed').length;
  };

  const [search, setSearch] = useState('');
  const visibleStaff = search.trim()
    ? staff.filter(s => [s.name, s.role, s.phone].some(v => v.toLowerCase().includes(search.trim().toLowerCase())))
    : staff;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <button 
            onClick={() => onNavigate(Page.ADMIN_DASHBOARD)}
            className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-4 hover:text-slate-900 transition-colors hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.1)]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl">
              <Users className="w-6 h-6 text-[rgb(106,176,160)]" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Personnel Fleet</h1>
          </div>
          <p className="text-slate-500 font-medium ml-11 mt-1">Manage, dispatch, and monitor your cleaning professionals.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[rgb(61,141,122)] px-8 py-4 rounded-2xl text-white font-bold flex items-center shadow-xl shadow-[rgb(204,236,229)] hover:bg-[rgb(45,110,95)] transition-all hover:shadow-[0_0_20px_rgba(61,141,122,0.7)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Recruit Personnel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Staff', value: staff.length.toString(), icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Active Load', value: tasks.filter(t => t.status === 'in-progress').length.toString(), icon: Briefcase, color: 'text-[rgb(61,141,122)]', bg: 'bg-[rgb(235,247,244)]' },
          { label: 'Unassigned', value: tasks.filter(t => t.cleanerName === 'Unassigned').length.toString(), icon: Clock, color: 'text-[rgb(61,141,122)]', bg: 'bg-[rgb(235,247,244)]' },
          { label: 'Completed Jobs', value: tasks.filter(t => t.status === 'completed').length.toString(), icon: TrendingUp, color: 'text-[rgb(61,141,122)]', bg: 'bg-[rgb(235,247,244)]' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-6`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          <h3 className="text-xl font-bold text-slate-900">Registered Dispatch Personnel</h3>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-6">Personnel</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Current Workload</th>
                <th className="px-8 py-6 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleStaff.length === 0 && (
                <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-300 font-bold">
                  {search ? 'No team members match your search.' : 'No team members yet — add your first cleaner above.'}
                </td></tr>
              )}
              {visibleStaff.map(member => {
                const workload = getWorkload(member.name);
                const isExpanded = expandedStaffId === member.id;
                return (
                  <React.Fragment key={member.id}>
                    <tr 
                      onClick={() => setExpandedStaffId(isExpanded ? null : member.id)}
                      className={`hover:bg-slate-50 transition-all cursor-pointer ${isExpanded ? 'bg-[rgb(235,247,244)]/30' : ''}`}
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-[rgb(61,141,122)] mr-2" /> : <ChevronDown className="w-4 h-4 text-slate-300 mr-2" />}
                          <div className="w-12 h-12 bg-slate-900 text-[rgb(106,176,160)] rounded-2xl flex items-center justify-center font-black text-sm mr-4 shadow-lg shadow-slate-200">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg leading-tight">{member.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          member.role === 'lead' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)] border-[rgb(204,236,229)]' :
                          member.role === 'team' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)] border-[rgb(204,236,229)]' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load</span>
                            <span className={`text-[10px] font-bold ${workload > 3 ? 'text-[rgb(106,176,160)]' : 'text-[rgb(106,176,160)]'}`}>{workload} Jobs</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${workload > 3 ? 'bg-[rgb(106,176,160)]' : 'bg-[rgb(106,176,160)]'}`}
                              style={{ width: `${Math.min((workload / 5) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <div className="flex items-center justify-end text-sm font-bold text-slate-600">
                           <Phone className="w-4 h-4 mr-2 text-slate-400" /> {member.phone}
                         </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={4} className="px-8 py-10">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-[rgb(61,141,122)]" /> Active Schedule
                              </h4>
                              <div className="space-y-4">
                                {tasks.filter(t => t.cleanerName === member.name).length === 0 ? (
                                  <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center italic text-slate-400 text-sm font-medium">
                                    No active turnovers assigned to this personnel.
                                  </div>
                                ) : (
                                  tasks.filter(t => t.cleanerName === member.name).map(t => (
                                    <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-slate-50 text-[rgb(61,141,122)] rounded-2xl">
                                          <Home className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-900">{t.propertyName}</p>
                                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.status.replace('-', ' ')} • {t.scheduledAt}</p>
                                        </div>
                                      </div>
                                      <div className="bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase">£{t.price}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                                <Zap className="w-5 h-5 mr-2 text-[rgb(106,176,160)]" /> Quick Dispatch
                              </h4>
                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
                                  Assign unassigned pipeline tasks directly to <span className="text-slate-900 font-black">{member.name}</span>.
                                </p>
                                
                                {tasks.filter(t => t.cleanerName === 'Unassigned').length === 0 ? (
                                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400 italic">
                                    All turnover tasks are currently assigned.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {tasks.filter(t => t.cleanerName === 'Unassigned').map(t => (
                                      <button 
                                        key={t.id}
                                        onClick={() => handleAssignTask(t.id, member.name)}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-[rgb(235,247,244)] hover:border-[rgb(172,216,206)] transition-all group flex items-center justify-between hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]"
                                      >
                                        <div>
                                          <p className="text-sm font-bold text-slate-900 group-hover:text-[rgb(45,110,95)]">{t.propertyName}</p>
                                          <p className="text-[10px] text-slate-400 font-black uppercase">{t.id}</p>
                                        </div>
                                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-[rgb(106,176,160)]" />
                                      </button>
                                    ))}
                                  </div>
                                )}

                                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between">
                                  <button 
                                    onClick={() => handleDeleteStaff(member.id)}
                                    className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 flex items-center hover:drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" /> Decommission Personnel
                                  </button>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref: {member.id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl">
             <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recruit Personnel</h2>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]">
                 <X className="w-6 h-6 text-slate-400" />
               </button>
             </div>
             <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel Full Name</label>
                  <input 
                    type="text" required placeholder="e.g. David Richardson" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 text-slate-900 font-bold"
                    value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Fleet Role</label>
                  <select 
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value as any})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 text-slate-900 font-bold"
                  >
                    <option value="lead">Lead Cleaner (Executive)</option>
                    <option value="junior">Junior Associate</option>
                    <option value="team">Multi-Staff Dispatch Team</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Contact Number</label>
                  <input 
                    type="tel" required placeholder="+44 7700 900XXX" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 text-slate-900 font-bold"
                    value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                  Add to Dispatch Fleet
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
