import React, { useState } from 'react';
import { CleaningTask } from '../types';
import { Zap, MessageCircle, Clock, Gift, Copy, Check, TrendingUp, Star, RotateCcw } from 'lucide-react';

// Paste your Google review link here once your Google Business Profile is live.
const GOOGLE_REVIEW_LINK = '';

interface ActionQueueProps {
  tasks: CleaningTask[];
  onTaskUpdate: (task: CleaningTask) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const waLink = (phone: string | undefined, text: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

const firstName = (name?: string) => (name || 'there').split(' ')[0];

const ActionQueue: React.FC<ActionQueueProps> = ({ tasks, onTaskUpdate }) => {
  const [copied, setCopied] = useState(false);
  const now = Date.now();
  const manageable = tasks.filter(t => !t.isGuestRequest && t.ownerPhone);

  // 1. New bookings needing a confirmation message
  const confirmations = manageable.filter(t => t.status === 'pending' && !t.confirmationSent);

  // 2. Confirmed but unpaid jobs needing a payment reminder
  const reminders = manageable.filter(t =>
    (t.status === 'pending' || t.status === 'in-progress') &&
    t.confirmationSent && !t.reminderSent && (t.paymentStatus ?? 'unpaid') !== 'paid'
  );

  // 3. Completed jobs within the 10-day loyalty window, offer not yet sent
  const rebooks = manageable.filter(t => {
    if (t.status !== 'completed' || t.rebookOfferSent || !t.completedAt) return false;
    const age = now - new Date(t.completedAt).getTime();
    return age >= 0 && age <= 10 * DAY_MS;
  });

  // Group completed jobs by client for lifecycle triggers
  const byOwner = new Map<string, CleaningTask[]>();
  manageable.forEach(t => {
    if (!t.ownerId) return;
    byOwner.set(t.ownerId, [...(byOwner.get(t.ownerId) || []), t]);
  });

  // 4. Review ask: client has 3+ completed cleans and has never been asked
  const reviewAsks: CleaningTask[] = [];
  // 5. Win-back: client's last clean was 30+ days ago, nothing booked, not yet contacted
  const winbacks: CleaningTask[] = [];

  byOwner.forEach(clientTasks => {
    const completed = clientTasks
      .filter(t => t.status === 'completed' && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    if (completed.length === 0) return;
    const latest = completed[0];
    const hasOpen = clientTasks.some(t => t.status === 'pending' || t.status === 'in-progress');

    if (completed.length >= 3 && !clientTasks.some(t => t.reviewRequestSent)) {
      reviewAsks.push(latest);
    }
    const age = now - new Date(latest.completedAt!).getTime();
    if (!hasOpen && age > 30 * DAY_MS && !latest.winbackSent) {
      winbacks.push(latest);
    }
  });

  const confirmationMsg = (t: CleaningTask) =>
    `Hi ${firstName(t.ownerName)}, confirming your clean: ${t.propertyAddress}, ${t.scheduledAt || 'date TBC'}, ${t.type === 'premium' ? 'Guest-Ready Plus' : 'Standard Turnover'}, ${t.beds} bed — £${t.price}. Includes photo confirmation after the clean. 50% (£${Math.round(t.price / 2)}) to book. Reply YES to confirm.`;

  const reminderMsg = (t: CleaningTask) =>
    `Hi ${firstName(t.ownerName)}, quick nudge — just need the ${(t.paymentStatus === 'deposit_paid') ? 'balance' : 'booking payment'} for the clean at ${t.propertyAddress} (£${t.price} total). Want me to hold the slot?`;

  const rebookMsg = (t: CleaningTask) =>
    `Hi ${firstName(t.ownerName)}, glad the turnover at ${t.propertyName} went well! Reminder: book your next clean within 10 days and you get £25 credit towards it. Want me to pencil in your next changeover?`;

  const reviewMsg = (t: CleaningTask) =>
    GOOGLE_REVIEW_LINK
      ? `Hi ${firstName(t.ownerName)}, glad the turnovers at ${t.propertyName} are running smoothly! Quick favour: a one-line Google review helps other hosts find us — ${GOOGLE_REVIEW_LINK} — takes 30 seconds. Thank you!`
      : `Hi ${firstName(t.ownerName)}, glad the turnovers at ${t.propertyName} are running smoothly! Quick favour: would you mind sending a line or two about how it's been? We'd love to use it as a review. Thank you!`;

  const winbackMsg = (t: CleaningTask) =>
    `Hi ${firstName(t.ownerName)}, it's been a little while since your last clean at ${t.propertyName}. If your current setup ever slips, we've got you covered — and there's £10 off your next turnover to get you back on the calendar. Want me to pencil one in?`;

  const sendAction = (t: CleaningTask, msg: string, flag: 'confirmationSent' | 'reminderSent' | 'rebookOfferSent' | 'reviewRequestSent' | 'winbackSent') => {
    window.open(waLink(t.ownerPhone, msg), '_blank', 'noopener');
    onTaskUpdate({ ...t, [flag]: true });
  };

  // Weekly report (pure data, no AI needed)
  const weekAgo = now - 7 * DAY_MS;
  const completedThisWeek = tasks.filter(t => t.status === 'completed' && t.completedAt && new Date(t.completedAt).getTime() >= weekAgo);
  const weekRevenue = completedThisWeek.reduce((s, t) => s + t.price, 0);
  const openPipeline = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
  const unpaidValue = tasks.filter(t => t.status !== 'cancelled' && (t.paymentStatus ?? 'unpaid') !== 'paid').reduce((s, t) => s + t.price, 0);

  const copyReport = async () => {
    const lines = [
      `AIROLA — Weekly Summary (${new Date().toLocaleDateString('en-GB')})`,
      `Cleans completed (7 days): ${completedThisWeek.length}`,
      `Revenue from completed cleans: £${weekRevenue}`,
      `Open pipeline: ${openPipeline.length} job${openPipeline.length === 1 ? '' : 's'}`,
      `Value awaiting payment: £${unpaidValue}`,
      completedThisWeek.length > 0 ? `Completed: ${completedThisWeek.map(t => `${t.propertyName} (£${t.price})`).join(', ')}` : '',
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const groups = [
    { title: 'Send booking confirmation', icon: <MessageCircle className="w-4 h-4" />, items: confirmations, msg: confirmationMsg, flag: 'confirmationSent' as const, color: 'text-[rgb(61,141,122)] bg-[rgb(235,247,244)]' },
    { title: 'Chase payment', icon: <Clock className="w-4 h-4" />, items: reminders, msg: reminderMsg, flag: 'reminderSent' as const, color: 'text-amber-700 bg-amber-50' },
    { title: 'Send £25 rebooking offer', icon: <Gift className="w-4 h-4" />, items: rebooks, msg: rebookMsg, flag: 'rebookOfferSent' as const, color: 'text-[rgb(61,141,122)] bg-[rgb(235,247,244)]' },
    { title: 'Ask for a review (3+ cleans done)', icon: <Star className="w-4 h-4" />, items: reviewAsks, msg: reviewMsg, flag: 'reviewRequestSent' as const, color: 'text-yellow-700 bg-yellow-50' },
    { title: 'Win back quiet client (30+ days)', icon: <RotateCcw className="w-4 h-4" />, items: winbacks, msg: winbackMsg, flag: 'winbackSent' as const, color: 'text-slate-600 bg-slate-100' },
  ];

  const totalActions = confirmations.length + reminders.length + rebooks.length + reviewAsks.length + winbacks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Action queue */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <span className="bg-slate-900 text-[rgb(106,176,160)] p-2 rounded-xl mr-3"><Zap className="w-5 h-5" /></span>
            Action Queue
          </h3>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${totalActions > 0 ? 'bg-[rgb(61,141,122)] text-white' : 'bg-slate-100 text-slate-400'}`}>
            {totalActions} due
          </span>
        </div>

        {totalActions === 0 ? (
          <p className="text-slate-400 text-sm font-medium py-6 text-center">All caught up. New actions appear here when bookings come in, payments are due, or completed jobs enter the 10-day rebooking window.</p>
        ) : (
          <div className="space-y-5">
            {groups.map(g => g.items.length > 0 && (
              <div key={g.title}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className={`p-1 rounded ${g.color}`}>{g.icon}</span> {g.title}
                </p>
                <div className="space-y-2">
                  {g.items.map(t => (
                    <div key={`${g.flag}-${t.id}`} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{t.propertyName} — {t.ownerName}</p>
                        <p className="text-xs text-slate-400 truncate">£{t.price} · {(t.paymentStatus ?? 'unpaid').replace('_', ' ')}</p>
                      </div>
                      <button
                        onClick={() => sendAction(t, g.msg(t), g.flag)}
                        className="shrink-0 px-4 py-2.5 bg-[rgb(61,141,122)] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[rgb(45,110,95)] transition-all flex items-center"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Send on WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly report */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[rgb(106,176,160)]" /> This Week
          </h3>
          <button onClick={copyReport} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Copy report">
            {copied ? <Check className="w-4 h-4 text-[rgb(106,176,160)]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
            <span className="text-slate-400 text-sm font-medium">Cleans completed</span>
            <span className="text-2xl font-black text-[rgb(106,176,160)]">{completedThisWeek.length}</span>
          </div>
          <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
            <span className="text-slate-400 text-sm font-medium">Revenue (completed)</span>
            <span className="text-2xl font-black">£{weekRevenue}</span>
          </div>
          <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
            <span className="text-slate-400 text-sm font-medium">Open pipeline</span>
            <span className="text-2xl font-black">{openPipeline.length}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-sm font-medium">Awaiting payment</span>
            <span className="text-2xl font-black text-amber-400">£{unpaidValue}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-6 leading-relaxed">Tap copy to paste this summary into your partner chat or weekly notes.</p>
      </div>
    </div>
  );
};

export default ActionQueue;
