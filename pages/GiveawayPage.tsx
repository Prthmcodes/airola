import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { db } from '../db';
import { appendToSheet } from '../sheets';
import { Trophy, Gift, Star, ChevronLeft } from 'lucide-react';

interface GiveawayPageProps {
  onNavigate: (page: Page) => void;
}

// Set the real end date of the giveaway here.
const GIVEAWAY_ENDS_AT = new Date('2026-08-15T23:59:59+01:00');

export const GiveawayPage: React.FC<GiveawayPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [exclusiveOffers, setExclusiveOffers] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, closed: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tick = () => {
      const distance = GIVEAWAY_ENDS_AT.getTime() - Date.now();
      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, closed: true });
        return;
      }
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
        closed: false
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (timeLeft.closed) {
      setError('Entries have closed. Follow us for the next giveaway!');
      return;
    }
    if (!phone && !email) {
      setError('Please enter either a phone number or an email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitGiveaway({ name, mobile: phone, email, experience, wantsOffers: exclusiveOffers });
      if (!result.success) {
        setError('Something went wrong. Please try again.');
        return;
      }
      appendToSheet('Sheet2', [new Date().toISOString(), name, phone, email, experience, exclusiveOffers ? 'Yes' : 'No']);
      onNavigate(Page.BONUS);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900 placeholder:text-slate-400";

  const prizes = [
    { icon: <Trophy className="w-7 h-7" />, label: 'Grand Prize', title: '£1 Full Turnover', sub: 'Worth up to £65' },
    { icon: <Gift className="w-7 h-7" />, label: 'Runner-Up', title: '£25 Credit', sub: 'Towards any clean' },
    { icon: <Star className="w-7 h-7" />, label: '3rd Prize', title: '£15 Credit', sub: 'Towards any clean' },
  ];

  return (
    <div className="bg-[rgb(249,239,239)] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <button onClick={() => onNavigate(Page.LANDING)} className="flex items-center text-slate-500 mb-10 hover:text-[rgb(61,141,122)] transition-colors font-bold text-sm">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-widest mb-6">
            <Trophy className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Launch Giveaway
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Win a <span className="text-[rgb(61,141,122)]">£1</span> Guest-Ready Turnover
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Exclusively for Airbnb and short-let hosts in East London. Tell us about your worst turnover experience, and we'll make sure it never happens again.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-14">
          {timeLeft.closed ? (
            <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xl">Entries closed</div>
          ) : (
            [
              { v: timeLeft.d, l: 'Days' },
              { v: timeLeft.h, l: 'Hours' },
              { v: timeLeft.m, l: 'Mins' },
              { v: timeLeft.s, l: 'Secs' },
            ].map(t => (
              <div key={t.l} className="w-20 sm:w-24 bg-white rounded-2xl border border-[rgb(204,236,229)] shadow-md py-4 text-center">
                <p className="text-3xl sm:text-4xl font-black text-[rgb(61,141,122)] tabular-nums">{String(t.v).padStart(2, '0')}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.l}</p>
              </div>
            ))
          )}
        </div>

        {/* Prizes */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {prizes.map((p, i) => (
            <div key={i} className={`p-8 rounded-[2rem] text-center border transition-all hover:-translate-y-1 hover:shadow-xl ${i === 0 ? 'bg-[rgb(61,141,122)] text-white border-[rgb(61,141,122)] shadow-xl' : 'bg-white text-slate-900 border-slate-100 shadow-md'}`}>
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${i === 0 ? 'bg-white/15 text-white' : 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)]'}`}>
                {p.icon}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${i === 0 ? 'text-[rgb(172,216,206)]' : 'text-[rgb(61,141,122)]'}`}>{p.label}</p>
              <h2 className="text-2xl font-black mb-1">{p.title}</h2>
              <p className={`text-sm ${i === 0 ? 'text-[rgb(204,236,229)]' : 'text-slate-500'}`}>{p.sub}</p>
            </div>
          ))}
        </div>

        {/* Entry form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Enter in 30 seconds</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="Your name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Phone</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="Your phone number" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Your email address" />
              </div>
            </div>
            <div>
              <label htmlFor="experience" className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Your worst turnover story</label>
              <textarea id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className={`${inputClass} min-h-[110px]`} placeholder="Cleaner cancelled an hour before check-in? Tell us..." rows={4} />
            </div>
            <label className="flex items-center text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={exclusiveOffers} onChange={(e) => setExclusiveOffers(e.target.checked)} className="mr-3 w-4 h-4 accent-[rgb(61,141,122)]" />
              Send me exclusive host offers
            </label>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting || timeLeft.closed} className={`w-full py-5 bg-[rgb(61,141,122)] text-white rounded-2xl font-black text-lg hover:bg-[rgb(45,110,95)] transition-all shadow-xl ${(isSubmitting || timeLeft.closed) ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {timeLeft.closed ? 'Entries Closed' : isSubmitting ? 'Submitting…' : 'Enter the Giveaway'}
            </button>
          </div>
        </form>
        <p className="text-sm text-slate-400 text-center mt-8">One entry per host. Limited to properties in our East London service area. Winners contacted directly.</p>
      </div>
    </div>
  );
};
