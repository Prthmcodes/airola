
import React, { useState, useEffect } from 'react';
import { Page, User, Property, QuoteData, CleaningTask } from '../types';
import { db } from '../db';
import { Plus, Home, MapPin, Clock, Sparkles, Package, Eye, Settings, TrendingUp, Calendar, CheckCircle2, ShieldAlert, ShieldCheck, Database, Phone, User as UserIcon, Check, X } from 'lucide-react';

interface OwnerDashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onSelectQuote: (quote: QuoteData) => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, onNavigate, onSelectQuote }) => {
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [activeTasks, setActiveTasks] = useState<CleaningTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CleaningTask[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchPortfolio = async () => {
    setIsSyncing(true);
    const [props, tasks] = await Promise.all([
      db.getProperties(user.email),
      db.getTasks(user.email)
    ]);
    
    // Load dismissed alerts from local storage to keep state across sessions
    const storedDismissed = JSON.parse(localStorage.getItem(`dismissed_tasks_${user.email}`) || '[]');
    setDismissedAlerts(storedDismissed);

    setMyProperties(props);
    setActiveTasks(tasks.filter(t => t.status !== 'completed'));
    
    // Get recently completed tasks
    const sortedCompleted = tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => b.id.localeCompare(a.id));
      
    setCompletedTasks(sortedCompleted);
    
    setTimeout(() => setIsSyncing(false), 600);
  };

  useEffect(() => {
    fetchPortfolio();
    window.addEventListener('storage_update', fetchPortfolio);
    return () => window.removeEventListener('storage_update', fetchPortfolio);
  }, [user.email]);

  const handleDismissAlert = (taskId: string) => {
    const newDismissed = [...dismissedAlerts, taskId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem(`dismissed_tasks_${user.email}`, JSON.stringify(newDismissed));
  };

  // Find tasks to show alerts for (completed but not dismissed)
  const alertsToShow = completedTasks.filter(t => !dismissedAlerts.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Host Hub<span className="text-[rgb(61,141,122)]">.</span></h1>
          <div className="flex items-center mt-2 space-x-3">
             <p className="text-slate-500 font-medium tracking-wide">
              {myProperties.length === 0 
                ? 'Ready to automate your turnover management?' 
                : `Managing ${myProperties.length} active listings across your portfolio.`}
            </p>
            {isSyncing && (
              <span className="flex items-center text-[10px] font-black text-[rgb(61,141,122)] uppercase tracking-widest">
                <Database className="w-3 h-3 mr-1" /> Syncing...
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={() => onNavigate(Page.ADD_PROPERTY)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center group hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]"
        >
          <Plus className="w-5 h-5 mr-2 transition-transform text-[rgb(106,176,160)]" /> 
          Register New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Work Completion Alerts - Displayed when an Admin marks a job as done */}
          {alertsToShow.slice(0, 3).map(task => (
            <div key={task.id} className="bg-[rgb(61,141,122)] rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl shadow-[rgb(204,236,229)] border border-[rgb(106,176,160)]">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                 </div>
                 <div>
                    <h4 className="font-bold text-lg">Work Completed</h4>
                    <p className="text-[rgb(204,236,229)] text-sm">Our team finished the turnover at <strong>{task.propertyName}</strong>. Listing is guest-ready!</p>
                 </div>
              </div>
              <button 
                onClick={() => handleDismissAlert(task.id)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]"
              >
                 <X className="w-3.5 h-3.5 mr-2" /> Acknowledge
              </button>
            </div>
          ))}

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center group hover:border-[rgb(204,236,229)] transition-colors">
            <div className="p-6 bg-[rgb(235,247,244)] rounded-[2rem] text-[rgb(61,141,122)] transition-transform">
              <Calendar className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <p className="text-[rgb(61,141,122)] font-black text-[10px] uppercase tracking-widest mb-1">Database Sync Active</p>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Check Calendar Integration</h3>
              <p className="text-slate-500 font-medium">Automatic turnovers based on your checkout dates.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">Sync All</button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-6 flex items-center">
                 <Clock className="w-5 h-5 mr-3 text-[rgb(106,176,160)]" /> Active Turnovers
               </h3>
               {activeTasks.filter(t => t.cleanerName && t.cleanerName !== 'Unassigned').length === 0 ? (
                 <p className="text-slate-400 text-sm italic py-4">No personnel currently dispatched to your listings.</p>
               ) : (
                 <div className="space-y-4">
                   {activeTasks.filter(t => t.cleanerName && t.cleanerName !== 'Unassigned').map(task => (
                     <div key={task.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-[rgb(106,176,160)] text-white rounded-2xl flex items-center justify-center font-black">
                           <UserIcon className="w-6 h-6" />
                         </div>
                         <div>
                           <p className="text-xs font-black text-[rgb(106,176,160)] uppercase tracking-widest">{task.propertyName}</p>
                           <h4 className="text-lg font-bold">{task.cleanerName}</h4>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{task.cleanerRole} Dispatch</p>
                         </div>
                       </div>
                       
                       <div className="flex flex-col md:items-end">
                         <div className="flex items-center text-[rgb(106,176,160)] font-black text-sm mb-1">
                            <Clock className="w-4 h-4 mr-2" /> ETA: {task.estimatedArrival || 'TBD'}
                         </div>
                         <div className="flex items-center text-slate-400 text-xs">
                            <Phone className="w-3.5 h-3.5 mr-2" /> {task.cleanerPhone}
                         </div>
                       </div>
                       
                       <a href={`tel:${task.cleanerPhone}`} className="px-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase hover:bg-[rgb(235,247,244)] transition-colors flex items-center hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]">
                         <Phone className="w-4 h-4 mr-2" /> Contact Lead
                       </a>
                     </div>
                   ))}
                 </div>
               )}
             </div>
             <Sparkles className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900">
              <TrendingUp className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" /> Pipeline Stats
           </h3>
           <div className="space-y-6 flex-grow">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Orders</p>
                 <p className="text-2xl font-black text-slate-900">{activeTasks.filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="p-5 bg-[rgb(235,247,244)] rounded-2xl border border-[rgb(204,236,229)]">
                 <p className="text-[10px] font-black text-[rgb(106,176,160)] uppercase tracking-widest mb-1">In Progress</p>
                 <p className="text-2xl font-black text-[rgb(61,141,122)]">{activeTasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <div className="p-5 bg-[rgb(235,247,244)] rounded-2xl border border-[rgb(204,236,229)]">
                 <p className="text-[10px] font-black text-[rgb(106,176,160)] uppercase tracking-widest mb-1">Completed Cleans</p>
                 <p className="text-2xl font-black text-[rgb(61,141,122)]">{completedTasks.length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Your Secure Portfolio</h2>
        <div className="flex space-x-2">
           <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full flex items-center">
             <ShieldCheck className="w-3 h-3 mr-1 text-[rgb(106,176,160)]" /> Isolated Host Data
           </span>
        </div>
      </div>

      {myProperties.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
             <Home className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Properties Registered</h3>
          <p className="text-slate-400 font-medium mb-8 max-w-xs mx-auto">Your database is empty. Add your first property to start booking turnover cleans.</p>
          <button 
            onClick={() => onNavigate(Page.ADD_PROPERTY)}
            className="bg-[rgb(61,141,122)] text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-[rgb(45,110,95)] transition-all flex items-center mx-auto hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
          >
            <Plus className="w-5 h-5 mr-2" /> Register First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {myProperties.map((prop) => {
            const propTasks = activeTasks.filter(t => t.propertyId === prop.id);
            const activeDispatch = propTasks.find(t => t.status === 'in-progress');
            const latestCompleted = completedTasks.find(t => t.propertyId === prop.id);
            
            return (
              <div key={prop.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl group hover:shadow-2xl transition-all flex flex-col lg:flex-row">
                <div className="lg:w-72 h-64 lg:h-auto overflow-hidden relative shrink-0 bg-gradient-to-br from-[rgb(61,141,122)] to-[rgb(30,80,68)] flex items-center justify-center min-h-[16rem]">
                  <Home className="w-20 h-20 text-white/20" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {prop.verificationStatus === 'verified' ? (
                      <div className="bg-[rgb(106,176,160)] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg w-fit">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                      </div>
                    ) : prop.verificationStatus === 'rejected' ? (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg w-fit">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Rejected
                      </div>
                    ) : (
                      <div className="bg-[rgb(106,176,160)] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg w-fit">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Vetting...
                      </div>
                    )}
                    
                    {/* Persistent completion status badge */}
                    {latestCompleted && (
                      <div className="bg-[rgb(106,176,160)] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg w-fit">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Guest Ready
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-[rgb(61,141,122)] transition-colors">{prop.name}</h3>
                      <div className="flex items-center text-slate-400 text-xs mt-1 font-bold">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-[rgb(106,176,160)]" /> {prop.address}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {activeDispatch && (
                    <div className="mb-6 p-4 bg-[rgb(235,247,244)] rounded-2xl border border-[rgb(204,236,229)]">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[9px] font-black text-[rgb(61,141,122)] uppercase tracking-widest">Active Turnover</p>
                          <p className="text-sm font-bold text-slate-900">{activeDispatch.cleanerName} en route</p>
                        </div>
                        <div className="text-[10px] font-black text-[rgb(61,141,122)]">ETA: {activeDispatch.estimatedArrival}</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Config</p>
                      <p className="font-bold text-slate-900 text-sm">{prop.beds}B / {prop.baths}Ba</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center justify-center text-[rgb(61,141,122)] font-black text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Jobs</p>
                      <div className="flex items-center justify-center text-slate-900 font-black text-sm">
                        {propTasks.length}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        onSelectQuote({
                          propertyId: prop.id,
                          propertyName: prop.name,
                          address: prop.address,
                          beds: prop.beds,
                          baths: prop.baths,
                          ownerName: user.name,
                          ownerEmail: user.email,
                          ownerPhone: user.phone || '',
                          cleaningType: 'standard',
                          isPriorityHost: false,
                          laundry: true,
                          toiletries: [],
                          frequency: 'one-time',
                          basePrice: 45,
                          totalPrice: 45,
                          listingDocUrl: prop.listingDocUrl
                        });
                        onNavigate(Page.QUOTE);
                      }}
                      className="flex-grow py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                    >
                      Book turnover
                    </button>
                    <button 
                      onClick={() => onNavigate(Page.PRICING)}
                      className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
             <Package className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Premium Managed Inventory</h4>
            <p className="text-slate-500 text-sm">Let us handle your premium amenities replenishment via our central database tracking.</p>
          </div>
        </div>
        <button className="whitespace-nowrap px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 hover:shadow-lg transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
          Contact Concierge
        </button>
      </div>
    </div>
  );
};

export default OwnerDashboard;
