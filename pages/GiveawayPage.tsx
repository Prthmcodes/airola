import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { db } from '../db';
import { appendToSheet } from '../sheets';
import { Trophy, Gift, Star, ChevronLeft, ChevronDown } from 'lucide-react';
import {
  GIVEAWAY_STARTS_AT, GIVEAWAY_ENDS_AT, GIVEAWAY_PROMOTER, GIVEAWAY_DRAW_METHOD, GIVEAWAY_PRIZE_VALID_DAYS,
  INSTAGRAM_HANDLE, isGiveawayOpen, formatUkDate,
} from '../config/promos';
import { whatsappWithText } from '../components/ContactOptions';

const SEND_FAILED = "We couldn't send that. Please try again, or message us on WhatsApp";
const NAME_MISSING = 'Please enter your name.';
const EMAIL_INVALID ='Please enter a valid email address.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const OPENS = formatUkDate(GIVEAWAY_STARTS_AT);
const CLOSES = formatUkDate(GIVEAWAY_ENDS_AT);

type Phase = 'upcoming' | 'open' | 'closed';
const phaseAt = (now: Date): Phase => (now < GIVEAWAY_STARTS_AT ? 'upcoming' : isGiveawayOpen(now) ? 'open' : 'closed');

interface GiveawayPageProps {
  onNavigate: (page: Page) => void;
}

export const GiveawayPage: React.FC<GiveawayPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [exclusiveOffers, setExclusiveOffers] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => phaseAt(new Date()));
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [error, setError] = useState('');
  const [sendFailed, setSendFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const current = phaseAt(now);
      setPhase(current);
      if (current !== 'open') return;
      const distance = GIVEAWAY_ENDS_AT.getTime() - now.getTime();
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSendFailed(false);

    const current = phaseAt(new Date());
    if (current !== 'open') {
      setError(current === 'upcoming' ? `Entries open ${OPENS}.` : 'Entries have closed. Follow us for the next giveaway!');
      return;
    }
    if (!name.trim()) {
      setError(NAME_MISSING);
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(EMAIL_INVALID);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitGiveaway({ name, mobile: phone, email, experience, wantsOffers: exclusiveOffers });
      if (!result.success) {
        setError(SEND_FAILED);
        setSendFailed(true);
        return;
      }
      appendToSheet('Sheet2', [new Date().toISOString(), name, phone, email, experience, exclusiveOffers ? 'Yes' : 'No']);
      onNavigate(Page.BONUS);
    } catch (e) {
      // Network or unexpected failure: keep the form filled and offer WhatsApp instead.
      console.error(e);
      setError(SEND_FAILED);
      setSendFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900 placeholder:text-slate-500";
  const labelClass = "block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]";
  const linkClass = "font-bold text-[#2D6E5F] underline underline-offset-2 hover:text-[#245A4E]";

  const prizes = [
    { icon: <Trophy className="w-7 h-7" />, label: 'Grand Prize', title: '£1 Full Turnover', sub: 'Standard Turnover for a 1-2 bedroom property, worth up to £65. Winner pays £1.' },
    { icon: <Gift className="w-7 h-7" />, label: 'Runner-Up', title: '£25 Credit', sub: 'Towards any clean' },
    { icon: <Star className="w-7 h-7" />, label: '3rd Prize', title: '£15 Credit', sub: 'Towards any clean' },
  ];

  return (
    <div className="bg-[rgb(249,239,239)] min-h-svh py-12">
      <div className="max-w-5xl mx-auto px-4">
        <RouteLink page={Page.LANDING} onNavigate={onNavigate} className="flex items-center min-h-[44px] text-slate-600 mb-10 hover:text-[#2D6E5F] transition-colors font-bold text-sm">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </RouteLink>

        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-[0.05em] mb-6">
            <Trophy className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Launch Giveaway
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Win a <span className="text-[#2D6E5F]">£1</span> Guest-Ready Turnover
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Exclusively for Airbnb and short-let hosts in East London. Tell us about your worst turnover experience, or just enter your details, and you could win. Free to enter.
          </p>
        </div>

        {/* Countdown */}
        <p className="text-center font-bold text-slate-700 mb-4">
          {phase === 'upcoming' ? `Opens ${OPENS}` : `Closes ${CLOSES}`}
          <span className="font-medium text-slate-600"> (UK time)</span>
        </p>
        <div className="flex justify-center gap-3 sm:gap-4 mb-14">
          {phase === 'closed' ? (
            <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xl">Entries closed</div>
          ) : phase === 'upcoming' ? (
            <div className="px-8 py-4 bg-white text-slate-900 border border-[rgb(204,236,229)] rounded-2xl font-black text-xl">Opening soon</div>
          ) : (
            [
              { v: timeLeft.d, l: 'Days' },
              { v: timeLeft.h, l: 'Hours' },
              { v: timeLeft.m, l: 'Mins' },
              { v: timeLeft.s, l: 'Secs' },
            ].map(t => (
              <div key={t.l} className="w-20 sm:w-24 bg-white rounded-2xl border border-[rgb(204,236,229)] shadow-md py-4 text-center">
                <p className="text-3xl sm:text-4xl font-black text-[#2D6E5F] tabular-nums">{String(t.v).padStart(2, '0')}</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.05em] mt-1">{t.l}</p>
              </div>
            ))
          )}
        </div>

        {/* Prizes */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {prizes.map((p, i) => (
            <div key={i} className={`p-8 rounded-[2rem] text-center border transition-all hover:-translate-y-1 hover:shadow-xl ${i === 0 ? 'bg-[#2D6E5F] text-white border-[rgb(61,141,122)] shadow-xl' : 'bg-white text-slate-900 border-slate-100 shadow-md'}`}>
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${i === 0 ? 'bg-white/15 text-white' : 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)]'}`}>
                {p.icon}
              </div>
              <p className={`text-xs font-black uppercase tracking-[0.05em] mb-2 ${i === 0 ? 'text-[rgb(204,236,229)]' : 'text-[#2D6E5F]'}`}>{p.label}</p>
              <h2 className="text-2xl font-black mb-1">{p.title}</h2>
              <p className={`text-sm ${i === 0 ? 'text-[rgb(204,236,229)]' : 'text-slate-500'}`}>{p.sub}</p>
            </div>
          ))}
        </div>

        {/* Entry form */}
        <form onSubmit={handleSubmit} noValidate className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Enter in 30 seconds</h2>
          <fieldset disabled={phase !== 'open'} className="space-y-6 min-w-0">
            <div>
              <label htmlFor="name" className={labelClass}>Name <span aria-hidden="true">*</span></label>
              <input type="text" id="name" autoComplete="name" aria-invalid={error === NAME_MISSING} aria-describedby={error === NAME_MISSING ? 'giveaway-error' : undefined} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="Your name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className={labelClass}>Email <span aria-hidden="true">*</span></label>
                <input type="email" id="email" autoComplete="email" required aria-invalid={error === EMAIL_INVALID} aria-describedby={error === EMAIL_INVALID ? 'giveaway-error' : undefined} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Your email address" />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
                <input type="tel" id="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="Your phone number" />
              </div>
            </div>
            <div>
              <label htmlFor="experience" className={labelClass}>Your worst turnover story (optional)</label>
              <textarea id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className={`${inputClass} min-h-[110px]`} placeholder="Cleaner cancelled an hour before check-in? Tell us..." rows={4} />
            </div>
            <label className="flex items-center min-h-[44px] text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={exclusiveOffers} onChange={(e) => setExclusiveOffers(e.target.checked)} className="mr-3 w-5 h-5 shrink-0 accent-[#2D6E5F]" />
              Send me exclusive host offers. You can unsubscribe at any time.
            </label>

            {error && (
              <div id="giveaway-error" role="alert" className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
                <p>{error}</p>
                {sendFailed && (
                  <a
                    href={whatsappWithText(`Hi Airola, I tried to enter the giveaway on your website but it didn't go through. Name: ${name || '-'}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center min-h-[44px] px-5 py-2 rounded-xl bg-[#2D6E5F] text-white hover:bg-[#245A4E]"
                  >
                    Message us on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className={`w-full py-5 bg-[#2D6E5F] text-white rounded-2xl font-black text-lg hover:bg-[#245A4E] transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed`}>
              {phase === 'closed' ? 'Entries Closed' : phase === 'upcoming' ? 'Opening soon' : isSubmitting ? 'Submitting…' : 'Enter the Giveaway'}
            </button>
          </fieldset>
          <p className="text-sm text-slate-600 text-center mt-6">
            One entry per person. By entering you agree to the terms below and our{' '}
            <RouteLink page={Page.LEGAL} onNavigate={onNavigate} className={linkClass}>Privacy Policy</RouteLink>.
          </p>
        </form>

        {/* Terms */}
        <details open className="group bg-white rounded-[2rem] border border-slate-100 shadow-md max-w-2xl mx-auto mt-8">
          <summary className="flex items-center justify-between gap-4 min-h-[44px] px-6 sm:px-8 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-black text-slate-900 text-lg">
            Giveaway terms
            <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ol className="list-decimal pl-10 pr-6 sm:pr-8 pb-8 space-y-3 text-sm text-slate-700 leading-relaxed">
            <li>Promoter: {GIVEAWAY_PROMOTER}.</li>
            <li>Free to enter, no purchase necessary. Open to people aged 18+ who host or manage a short-let in Airola's East London service area (Stratford, Royal Wharf, Canary Wharf, Canning Town, Hackney Wick, Bow, Mile End, Leyton).</li>
            <li>Opens {OPENS}, closes {CLOSES}, UK time. One entry per person across all routes.</li>
            <li>Entry routes: this form, or follow @{INSTAGRAM_HANDLE} on Instagram and comment TURNOVER on the giveaway post.</li>
            <li>Winners are chosen by {GIVEAWAY_DRAW_METHOD} and contacted by email, phone or Instagram message within 3 days of closing. If a winner does not reply within 7 days, another is drawn. Winners are announced on @{INSTAGRAM_HANDLE}.</li>
            <li>The name of the winners is available on request by emailing contact@airola.co.uk. Winners' names will only be published with their permission.</li>
            <li>Prizes: 1 × Standard Turnover for a 1-2 bedroom property for £1 (worth up to £65); 1 × £25 credit; 1 × £15 credit, each towards a booking. Valid for {GIVEAWAY_PRIZE_VALID_DAYS} days, subject to availability. No cash alternative. Not transferable.</li>
            <li>
              Your details are used to run the giveaway and, only if you tick the box, to send host offers. See the{' '}
              <RouteLink page={Page.LEGAL} onNavigate={onNavigate} className={linkClass}>Privacy Policy</RouteLink>.
            </li>
            <li>This promotion is not sponsored, endorsed or administered by Instagram. Entrants release Instagram from any liability.</li>
            <li>The promoter may amend or withdraw the giveaway if circumstances outside its control require it.</li>
          </ol>
        </details>
      </div>
    </div>
  );
};
