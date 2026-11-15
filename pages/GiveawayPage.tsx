import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { db } from '../db';
import { appendToSheet } from '../sheets';
import { Trophy, Gift, Star, ChevronLeft, ChevronDown } from 'lucide-react';
import {
  GIVEAWAY_STARTS_AT, GIVEAWAY_ENDS_AT, GIVEAWAY_PROMOTER, GIVEAWAY_DRAW_METHOD, GIVEAWAY_PRIZE_VALID_DAYS,
  GIVEAWAY_CAMPAIGN, INSTAGRAM_URL, INSTAGRAM_HANDLE, isGiveawayOpen, formatUkDate,
} from '../config/promos';
import { AREA_PAGES } from '../config/areas';
import { TIER_NAMES, tierPrice } from '../config/pricing';
import { whatsappWithText } from '../components/ContactOptions';

const SEND_FAILED = "We couldn't send that. Please try again, or message us on WhatsApp";
const ALREADY_ENTERED = "You've already entered this giveaway with that email address. Only one entry per person is allowed.";
const NAME_MISSING = 'Please enter your name.';
const EMAIL_INVALID = 'Please enter a valid email address.';
const AREA_MISSING = 'Please choose the area your property is in.';
const TERMS_MISSING = 'Please confirm you have read the terms and privacy notice and are 18 or over.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const OPENS = formatUkDate(GIVEAWAY_STARTS_AT);
const CLOSES = formatUkDate(GIVEAWAY_ENDS_AT);

// Eligible areas: the areas Airola serves, from config/areas.ts.
const AREAS = Object.values(AREA_PAGES).map(a => a.name);
const AREAS_TEXT = `${AREAS.slice(0, -1).join(', ')} and ${AREAS[AREAS.length - 1]}`;

// 1st prize: a free Standard Turnover for up to 2 bedrooms.
const FIRST_PRIZE_1_BED = tierPrice('standard', 1);
const FIRST_PRIZE_2_BED = tierPrice('standard', 2);

type Phase = 'upcoming' | 'open' | 'closed';
const phaseAt = (now: Date): Phase => (now < GIVEAWAY_STARTS_AT ? 'upcoming' : isGiveawayOpen(now) ? 'open' : 'closed');

interface GiveawayPageProps {
  onNavigate: (page: Page) => void;
}

export const GiveawayPage: React.FC<GiveawayPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [experience, setExperience] = useState('');
  // None pre-ticked.
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [wantsOffers, setWantsOffers] = useState(false);
  const [storyPublishOk, setStoryPublishOk] = useState(false);
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
      setError(current === 'upcoming' ? `Entries open ${OPENS}.` : 'Entries have closed.');
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
    if (!AREAS.includes(area)) {
      setError(AREA_MISSING);
      return;
    }
    if (!termsAccepted) {
      setError(TERMS_MISSING);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitGiveaway({
        name: name.trim(), mobile: phone.trim(), email: email.trim(), area, experience,
        termsAccepted, wantsOffers, storyPublishOk, campaign: GIVEAWAY_CAMPAIGN,
      });
      if (!result.success) {
        setError(result.duplicate ? ALREADY_ENTERED : SEND_FAILED);
        setSendFailed(!result.duplicate);
        return;
      }
      appendToSheet('Sheet2', [
        new Date().toISOString(), name, phone, email, experience, wantsOffers ? 'Yes' : 'No',
        area, storyPublishOk ? 'Yes' : 'No', GIVEAWAY_CAMPAIGN,
      ]);
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
  const checkClass = "mr-3 mt-0.5 w-5 h-5 shrink-0 accent-[#2D6E5F]";
  const describedBy = (msg: string) => (error === msg ? 'giveaway-error' : undefined);

  const prizes = [
    { icon: <Trophy className="w-7 h-7" />, label: '1st Prize', title: 'Free Standard Turnover', sub: `For a property of up to 2 bedrooms, worth £${FIRST_PRIZE_1_BED} for a 1-bed or £${FIRST_PRIZE_2_BED} for a 2-bed` },
    { icon: <Gift className="w-7 h-7" />, label: '2nd Prize', title: '£25 Credit', sub: 'Taken off the price of one booked clean' },
    { icon: <Star className="w-7 h-7" />, label: '3rd Prize', title: '£15 Credit', sub: 'Taken off the price of one booked clean' },
  ];

  return (
    <div className="bg-[rgb(249,239,239)] min-h-svh py-12">
      <div className="max-w-5xl mx-auto px-4">
        <RouteLink page={Page.LANDING} onNavigate={onNavigate} className="flex items-center min-h-[44px] text-slate-600 mb-10 hover:text-[#2D6E5F] transition-colors font-bold text-sm">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </RouteLink>

        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-[0.05em] mb-6">
            <Trophy className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Host Giveaway
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Win a <span className="text-[#2D6E5F]">Free</span> Turnover Clean
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            For Airbnb and short-let hosts in {AREAS_TEXT}. Three winners, chosen by random draw. Free to enter: no purchase or payment at any stage.
          </p>
        </div>

        {/* Countdown */}
        <p className="text-center font-bold text-slate-700 mb-4">
          {phase === 'upcoming' ? `Opens ${OPENS}` : phase === 'open' ? `Closes ${CLOSES}` : `Closed ${CLOSES}`}
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
              <p className={`text-sm ${i === 0 ? 'text-[rgb(204,236,229)]' : 'text-slate-600'}`}>{p.sub}</p>
            </div>
          ))}
        </div>

        {/* Entry form (open), or what happens next (closed / not yet open) */}
        {phase === 'open' ? (
        <form id="enter" onSubmit={handleSubmit} noValidate className="bg-white p-6 sm:p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Enter for free</h2>
          <p className="text-sm text-slate-600 mb-8">One entry per person. Fields marked * are required.</p>
          <fieldset disabled={isSubmitting} className="space-y-6 min-w-0">
            <div>
              <label htmlFor="name" className={labelClass}>Name <span aria-hidden="true">*</span></label>
              <input type="text" id="name" autoComplete="name" required aria-invalid={error === NAME_MISSING} aria-describedby={describedBy(NAME_MISSING)} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className={labelClass}>Email <span aria-hidden="true">*</span></label>
                <input type="email" id="email" autoComplete="email" required aria-invalid={error === EMAIL_INVALID || error === ALREADY_ENTERED} aria-describedby={describedBy(EMAIL_INVALID) || describedBy(ALREADY_ENTERED)} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Your email address" />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
                <input type="tel" id="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="Your phone number" />
              </div>
            </div>
            <div>
              <label htmlFor="area" className={labelClass}>Area of your property <span aria-hidden="true">*</span></label>
              <select id="area" required aria-invalid={error === AREA_MISSING} aria-describedby={describedBy(AREA_MISSING)} value={area} onChange={(e) => setArea(e.target.value)} className={inputClass}>
                <option value="">Choose an area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="experience" className={labelClass}>Your worst turnover story (optional)</label>
              <textarea id="experience" aria-describedby="experience-note" value={experience} onChange={(e) => setExperience(e.target.value)} className={`${inputClass} min-h-[110px]`} placeholder="Cleaner cancelled an hour before check-in? Tell us..." rows={4} />
              <p id="experience-note" className="mt-2 text-sm text-slate-600">Please do not name any person, company, address or listing.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start min-h-[44px] text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" required aria-invalid={error === TERMS_MISSING} aria-describedby={describedBy(TERMS_MISSING)} checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className={checkClass} />
                <span>
                  I have read the <a href="#giveaway-terms" className={linkClass}>terms</a> and{' '}
                  <RouteLink page={Page.LEGAL} onNavigate={onNavigate} className={linkClass}>privacy notice</RouteLink> and I am 18 or over. <span aria-hidden="true">*</span>
                </span>
              </label>
              <label className="flex items-start min-h-[44px] text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={wantsOffers} onChange={(e) => setWantsOffers(e.target.checked)} className={checkClass} />
                <span>Email me host tips and offers from Airola. I can unsubscribe at any time. (optional)</span>
              </label>
              <label className="flex items-start min-h-[44px] text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={storyPublishOk} onChange={(e) => setStoryPublishOk(e.target.checked)} className={checkClass} />
                <span>Airola may publish an anonymised version of my story. (optional)</span>
              </label>
            </div>

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

            <button type="submit" className="w-full py-5 bg-[#2D6E5F] text-white rounded-2xl font-black text-lg hover:bg-[#245A4E] transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting…' : 'Enter the Giveaway'}
            </button>
          </fieldset>
        </form>
        ) : (
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto text-center">
          {phase === 'closed' ? (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-4">This giveaway has closed</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Entries closed {CLOSES} (UK time). The draw takes place within 7 days of closing, and winners are contacted by email or phone within 3 days of the draw. Follow @{INSTAGRAM_HANDLE} to hear about the next one.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Entries open soon</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                The entry form opens {OPENS} (UK time). Read the terms below in the meantime.
              </p>
            </>
          )}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-[#2D6E5F] text-white rounded-2xl font-bold hover:bg-[#245A4E] transition-colors">
            Follow @{INSTAGRAM_HANDLE}<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        )}

        {/* Terms */}
        <details id="giveaway-terms" open className="group bg-white rounded-[2rem] border border-slate-100 shadow-md max-w-2xl mx-auto mt-8 scroll-mt-28">
          <summary className="flex items-center justify-between gap-4 min-h-[44px] px-6 sm:px-8 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-black text-slate-900 text-lg">
            Giveaway terms
            <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ol className="list-decimal pl-10 pr-6 sm:pr-8 pb-8 space-y-3 text-sm text-slate-700 leading-relaxed">
            <li>Promoter: {GIVEAWAY_PROMOTER}.</li>
            <li>How to enter: complete the entry form on this page. Entry is free. No purchase or payment is needed at any stage. One entry per person.</li>
            <li>Who can enter: UK residents aged 18 or over who host an Airbnb or short-let in an area Airola serves ({AREAS_TEXT}). People who work for Airola and their households cannot enter.</li>
            <li>The giveaway opens {OPENS} and closes {CLOSES}, UK time. Entries received outside these times are not accepted.</li>
            <li>
              Prizes, for three winners:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>1st: one free {TIER_NAMES.standard} for a property of up to 2 bedrooms (worth £{FIRST_PRIZE_1_BED} for a 1-bed or £{FIRST_PRIZE_2_BED} for a 2-bed).</li>
                <li>2nd: £25 cleaning credit.</li>
                <li>3rd: £15 cleaning credit.</li>
              </ul>
            </li>
            <li>Credits are taken off the price of one booked clean. A prize is claimed when the winner books a clean with Airola, within {GIVEAWAY_PRIZE_VALID_DAYS} days of being notified. The property must be in an area Airola serves ({AREAS_TEXT}). There is no cash alternative. Prizes cannot be combined with other offers or transferred.</li>
            <li>The three winners are chosen by {GIVEAWAY_DRAW_METHOD}. The draw takes place within 7 days of the closing date.</li>
            <li>Winners are contacted by email or phone within 3 days of the draw and have 7 days to reply. If a winner does not reply within 7 days, another winner is drawn.</li>
            <li>Winners' names are not published without their consent. The name of the winners is available on request by emailing contact@airola.co.uk.</li>
            <li>
              Your details are used to run the giveaway. Only if you tick the boxes, we also email you host tips and offers, or publish an anonymised version of your story. See the{' '}
              <RouteLink page={Page.LEGAL} onNavigate={onNavigate} className={linkClass}>privacy notice</RouteLink>.
            </li>
            <li>This promotion is in no way sponsored, endorsed or administered by, or associated with, Instagram, Facebook or Meta. By entering you release them from any liability.</li>
            <li>The promoter may amend or withdraw the giveaway if circumstances outside its control require it.</li>
          </ol>
        </details>
      </div>
    </div>
  );
};
