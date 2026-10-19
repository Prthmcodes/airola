
import React, { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from './useFocusTrap';
import { AirolaNotification, UserRole, User } from '../types';
import { X, Mail, ShieldCheck, CheckCircle2, Clock, Trash2, ArrowRight, ExternalLink, Phone } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AirolaNotification[];
  userRole: UserRole;
  user?: User; // Pass current user for email filtering
  onMarkRead: (id: string) => void;
  onMarkAllRead: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onViewDetails: (note: AirolaNotification) => Promise<boolean>;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  userRole, 
  user,
  onMarkRead, 
  onMarkAllRead,
  onDelete,
  onViewDetails
}) => {
  // The database only returns notifications this user is allowed to see;
  // filter by role for safety and sort newest first.
  const filtered = notifications
    .filter(n => n.recipientRole === userRole)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, panelRef, onClose);

  // Opening the mailbox marks everything in it as read (clearing the badge), but items that were
  // unread when it opened keep their unread look until it's closed.
  const [unreadAtOpen, setUnreadAtOpen] = useState<Set<string>>(new Set());
  const [unavailableId, setUnavailableId] = useState<string | null>(null);
  useEffect(() => {
    if (!isOpen) { setUnavailableId(null); setUnreadAtOpen(new Set()); return; }
    const ids = filtered.filter(n => !n.read).map(n => n.id);
    setUnreadAtOpen(new Set(ids));
    if (ids.length) onMarkAllRead(ids);
  }, [isOpen]);

  const viewDetails = async (note: AirolaNotification) => {
    setUnavailableId(null);
    if (!(await onViewDetails(note))) setUnavailableId(note.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="notifications-title" className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
        <div className="on-dark p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-[rgb(106,176,160)]" />
            <h2 id="notifications-title" className="text-xl font-bold tracking-tight italic">Airola Mailbox<span className="text-[rgb(106,176,160)]">.</span></h2>
          </div>
          <button onClick={onClose} aria-label="Close notifications" className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]">
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
                <Mail className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Your inbox is empty</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Notifications regarding availability requests, booking confirmations, and cleaning completions will appear here.</p>
            </div>
          ) : (
            filtered.map((note) => {
              const unread = !note.read || unreadAtOpen.has(note.id);
              return (
              <div 
                key={note.id} 
                className={`bg-white rounded-[2rem] border transition-all hover:shadow-lg overflow-hidden ${
                  !unread ? 'border-slate-100 opacity-75' : 'border-[rgb(172,216,206)] ring-2 ring-[rgb(235,247,244)]'
                }`}
                onClick={() => onMarkRead(note.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${
                        note.type === 'cleaning_complete' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)]' :
                        note.type === 'dispatch' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)]' :
                        note.type === 'quote_request' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)]' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {note.type === 'cleaning_complete' ? <CheckCircle2 className="w-5 h-5" /> :
                         note.type === 'dispatch' ? <Phone className="w-5 h-5" /> :
                         note.type === 'quote_request' ? <Clock className="w-5 h-5" /> :
                         <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{note.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{new Date(note.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {unread && (
                      <div className="w-2.5 h-2.5 bg-[rgb(106,176,160)] rounded-full" aria-label="Unread"></div>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">{note.subject}</h4>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium mb-4 whitespace-pre-line">
                    {note.body}
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center transition-colors hover:drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Archive
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); viewDetails(note); }} className="text-xs font-black text-[rgb(61,141,122)] uppercase tracking-widest hover:text-[rgb(45,110,95)] flex items-center hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]">
                      View details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                  {unavailableId === note.id && (
                    <p role="alert" className="mt-3 text-xs font-bold text-red-600">This booking is no longer available.</p>
                  )}
                </div>
              </div>
              );
            })
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
             <ShieldCheck className="w-4 h-4 text-[rgb(106,176,160)]" />
             <p>Airola UK Official Correspondence Center</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
