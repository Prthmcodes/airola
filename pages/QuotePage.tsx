import React, { useState, useEffect } from 'react';
import { Page, QuoteData, User as UserType } from '../types';
import { safePrice, PRICE_FALLBACK_TEXT } from '../utils/quoteSafety';
import { STANDARD_ADD_ONS, TIER_NAMES, tierName, tierPrice, everyTurnoverPrice, EVERY_TURNOVER_RULE, EVERY_TURNOVER_WINDOW_DAYS } from '../config/pricing';
import {
  ChevronRight, ChevronLeft, Sparkles, CheckCircle, Calendar as CalendarIcon,
  Link as LinkIcon, MapPin, ClipboardList, User, Phone, Mail, Shield, Star, Check,
  Package, UtensilsCrossed, Refrigerator, MessageCircle, Info
} from 'lucide-react';

interface QuotePageProps {
  quote: QuoteData;
  setQuote: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNavigate: (page: Page) => void;
  user: UserType;
}

const QuotePage: React.FC<QuotePageProps> = ({ quote, setQuote, onNavigate, user }) => {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const showFieldErrors = step === 2 && stepError !== '';
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quote.ownerEmail || '');
  const totalSteps = 2;

  // Paid add-ons exist for Standard Turnover only; Premium Turnover already includes all of them.
  const ADD_ON_ICONS: Record<string, React.ReactNode> = {
    essentials: <Package className="w-6 h-6" />,
    dishwashing: <UtensilsCrossed className="w-6 h-6" />,
    appliance: <Refrigerator className="w-6 h-6" />,
  };
  const addOns = STANDARD_ADD_ONS.map(a => ({ ...a, icon: ADD_ON_ICONS[a.id], priceText: `£${a.price}` }));
  const showAddOns = quote.cleaningType === 'standard';
  // Only add-ons that exist and apply to the chosen package (drops e.g. a stale 'linen' from an old draft).
  const activeAddOns = showAddOns ? quote.toiletries.filter(id => addOns.some(a => a.id === id)) : [];

  // A quote is always for a first clean, so the total is always the one-off price.
  const beds = Math.max(1, quote.beds || 1);
  const priceFor = (tier: string) => tierPrice(tier, beds);

  // Pre-fill host info when logged in
  useEffect(() => {
    if (user.isLoggedIn) {
      setQuote(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.name || '',
        ownerEmail: prev.ownerEmail || user.email || '',
        ownerPhone: prev.ownerPhone || user.phone || ''
      }));
    }
  }, [user.isLoggedIn, user.name, user.email, user.phone]);

  // Live price. Also keeps the saved quote consistent: one-off frequency, and only add-ons that apply.
  useEffect(() => {
    const price = priceFor(quote.cleaningType);
    const addOnsTotal = activeAddOns.reduce((total, addonId) => total + (addOns.find(a => a.id === addonId)?.price ?? 0), 0);
    setQuote(prev => ({
      ...prev,
      frequency: 'one-time',
      toiletries: activeAddOns.length === prev.toiletries.length ? prev.toiletries : activeAddOns,
      basePrice: price,
      totalPrice: price + addOnsTotal,
    }));
  }, [quote.cleaningType, quote.toiletries, quote.beds, quote.frequency]);

  const toggleAddon = (id: string) => {
    setQuote(prev => ({
      ...prev,
      toiletries: prev.toiletries.includes(id)
        ? prev.toiletries.filter(i => i !== id)
        : [...prev.toiletries, id]
    }));
  };

  const nextStep = () => {
    if (step === 2) {
      if (!quote.address || !quote.ownerName || !quote.ownerPhone || !quote.ownerEmail) {
        setStepError('Please add your name, email, phone and property address so we can confirm your quote.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quote.ownerEmail)) {
        setStepError('Please enter a valid email address.');
        return;
      }
    }
    setStepError('');
    if (step < totalSteps) setStep(step + 1);
    else onNavigate(Page.REVIEW);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStepError('');
    if (step > 1) setStep(step - 1);
    else onNavigate(user.isLoggedIn ? Page.DASHBOARD : Page.LANDING);
  };

  const inputClass = "w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Get Your Price</h1>
            <p className="text-slate-600 font-medium tracking-wide">
              Step {step} of {totalSteps}: {step === 1 ? 'Build your clean — your price updates live' : 'Your details'}
            </p>

            <div className="w-full bg-slate-100 h-3 mt-6 rounded-full overflow-hidden">
              <div
                className="h-full bg-[rgb(61,141,122)] transition-all duration-700 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl min-h-[500px]">
            {step === 1 && (
              <div className="space-y-12">
                {/* Property size */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Your Property</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p id="beds-label" className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.05em]">Bedrooms</p>
                      <div className="flex flex-wrap gap-3" role="group" aria-labelledby="beds-label">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <button
                            key={n}
                            type="button"
                            aria-pressed={quote.beds === n}
                            onClick={() => setQuote({ ...quote, beds: n })}
                            className={`w-14 h-14 rounded-2xl border-2 font-black text-lg transition-all ${
                              quote.beds === n ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-[#2D6E5F] shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p id="baths-label" className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.05em]">Bathrooms</p>
                      <div className="flex flex-wrap gap-3" role="group" aria-labelledby="baths-label">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            type="button"
                            aria-pressed={quote.baths === n}
                            onClick={() => setQuote({ ...quote, baths: n })}
                            className={`w-14 h-14 rounded-2xl border-2 font-black text-lg transition-all ${
                              quote.baths === n ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-[#2D6E5F] shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Clean</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { id: 'standard', name: TIER_NAMES.standard, icon: <Sparkles className="w-6 h-6" />, desc: 'Full turnover of kitchen, bathroom and floors, linen change and bed making with your clean linen, bins emptied, damage and low-stock check, and photo confirmation.' },
                      { id: 'premium', name: TIER_NAMES.premium, icon: <Star className="w-6 h-6" />, desc: 'Everything in Standard plus dishwashing and kitchen reset, inside fridge and microwave, essentials restocked from your supplies, priority booking and a pre-check-in double inspection.' }
                    ].map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        aria-pressed={quote.cleaningType === pkg.id}
                        onClick={() => setQuote({ ...quote, cleaningType: pkg.id as any })}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all relative group ${
                          quote.cleaningType === pkg.id
                            ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] shadow-xl'
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                          quote.cleaningType === pkg.id ? 'bg-[#2D6E5F] text-white' : 'bg-white text-slate-400 shadow-sm'
                        }`}>
                          {pkg.icon}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">{pkg.name}</h3>
                        <p className="price text-2xl text-[#2D6E5F] mb-2">{safePrice(priceFor(pkg.id)) !== null ? `£${priceFor(pkg.id)}` : <span className="text-base">{PRICE_FALLBACK_TEXT}</span>}</p>
                        <p className="text-slate-600 text-sm lg:text-xs font-medium leading-relaxed">{pkg.desc}</p>
                        {quote.cleaningType === pkg.id && (
                          <div className="absolute top-5 right-5 bg-[#2D6E5F] text-white p-1 rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Information only: nothing here changes the first-clean total. */}
                  <p className="mt-4 text-sm text-slate-600 font-medium flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-[rgb(61,141,122)]" aria-hidden="true" />
                    <span>Price from your second clean: £{everyTurnoverPrice(quote.cleaningType, beds)}. {EVERY_TURNOVER_RULE}</span>
                  </p>
                </div>

                {/* Add-ons: Standard Turnover only */}
                {showAddOns ? (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">Add-Ons <span className="text-sm font-medium text-slate-500">(optional)</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {addOns.map(addon => {
                      const selected = activeAddOns.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 sm:gap-4 ${
                            selected ? 'bg-[rgb(235,247,244)] border-[rgb(61,141,122)] shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            selected ? 'bg-[#2D6E5F] text-white' : 'bg-slate-50 text-[rgb(61,141,122)]'
                          }`}>
                            {addon.icon}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                              <h3 className={`font-bold ${selected ? 'text-[rgb(45,110,95)]' : 'text-slate-900'}`}>{addon.name}</h3>
                              <span className="price text-xs text-[#2D6E5F]">{addon.priceText}</span>
                            </div>
                            <p className="text-slate-600 text-sm lg:text-xs font-medium mt-0.5">{addon.description}</p>
                          </div>
                          <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selected ? 'bg-[#2D6E5F] border-[rgb(61,141,122)] text-white' : 'border-slate-200 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                ) : (
                  <p className="text-sm text-slate-600 font-medium">
                    {TIER_NAMES.premium} already includes dishwashing, inside fridge and microwave, and essentials restocking, so there are no add-ons to choose.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 text-slate-900">Where do we send your quote?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="quote-name" className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input id="quote-name" autoComplete="name" aria-invalid={showFieldErrors && !quote.ownerName} aria-describedby={showFieldErrors && !quote.ownerName ? 'quote-error' : undefined} type="text" value={quote.ownerName || ''} onChange={(e) => setQuote({ ...quote, ownerName: e.target.value })} placeholder="e.g. John Doe" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="quote-email" className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input id="quote-email" autoComplete="email" aria-invalid={showFieldErrors && emailInvalid} aria-describedby={showFieldErrors && emailInvalid ? 'quote-error' : undefined} type="email" value={quote.ownerEmail || ''} onChange={(e) => setQuote({ ...quote, ownerEmail: e.target.value })} placeholder="e.g. john@example.com" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="quote-phone" className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]">Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input id="quote-phone" autoComplete="tel" aria-invalid={showFieldErrors && !quote.ownerPhone} aria-describedby={showFieldErrors && !quote.ownerPhone ? 'quote-error' : undefined} type="tel" value={quote.ownerPhone || ''} onChange={(e) => setQuote({ ...quote, ownerPhone: e.target.value })} placeholder="+44 7700 900000" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="quote-address" className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]">Property Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea id="quote-address" autoComplete="street-address" aria-invalid={showFieldErrors && !quote.address} aria-describedby={showFieldErrors && !quote.address ? 'quote-error' : undefined} value={quote.address || ''} onChange={(e) => setQuote({ ...quote, address: e.target.value })} placeholder="Street address and postcode" className={`${inputClass} min-h-[90px]`} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="quote-notes" className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]">Notes <span className="normal-case font-medium">(optional)</span></label>
                      <div className="relative">
                        <ClipboardList className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea id="quote-notes" value={quote.notes || ''} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} placeholder="Entry instructions, pets, anything we should know" className={`${inputClass} min-h-[90px]`} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="quote-calendar" className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.05em]">Airbnb Calendar Link <span className="normal-case font-medium">(optional)</span></label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input id="quote-calendar" type="url" value={quote.calendarUrl || ''} onChange={(e) => setQuote({ ...quote, calendarUrl: e.target.value })} placeholder="https://www.airbnb.com/calendar/export/..." className={inputClass} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500 flex items-start"><CalendarIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /> Share it and we auto-schedule cleans around your check-outs. We only see dates, never guest details.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stepError && (
              <div id="quote-error" role="alert" className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
                {stepError}
              </div>
            )}

            <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button onClick={prevStep} className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-500 hover:text-[#2D6E5F] flex items-center min-h-[44px] transition-colors">
                  <MessageCircle className="w-4 h-4 mr-1.5" /> Prefer WhatsApp? Message us
                </a>
                <button onClick={nextStep} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center">
                  {step === totalSteps ? 'Review My Quote' : 'Continue'} <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live estimate sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white sticky top-28 shadow-2xl">
            <h2 className="text-xl font-bold mb-8 border-b border-white/10 pb-6">Your Price</h2>
            <div className="space-y-4 mb-8">
              {(user.isLoggedIn || quote.ownerName) && (
                <div className="mb-4">
                  <p className="text-xs font-black uppercase text-[rgb(106,176,160)] tracking-[0.05em] mb-1">Host</p>
                  <p className="text-sm font-bold truncate">{user.isLoggedIn ? user.name : quote.ownerName}</p>
                  <p className="text-xs text-slate-400 font-medium">{user.isLoggedIn ? user.email : quote.ownerEmail || ''}</p>
                </div>
              )}

              <div className="flex justify-between gap-4 lg:gap-0 text-slate-400 font-medium text-sm">
                <span>
                  {tierName(quote.cleaningType)} ({quote.beds} bed{quote.beds > 1 ? 's' : ''}, {quote.baths} bath{quote.baths > 1 ? 's' : ''})
                </span>
                <span className="price text-white">{safePrice(quote.basePrice) !== null ? `£${quote.basePrice}` : '–'}</span>
              </div>

              {activeAddOns.map(addonId => {
                const addon = addOns.find(a => a.id === addonId);
                if (!addon) return null;
                return (
                  <div key={addonId} className="flex justify-between gap-4 lg:gap-0 text-slate-400 font-medium text-xs">
                    <span>{addon.name}</span>
                    <span className="price text-white">£{addon.price}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-8 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-[0.05em]">First Clean</span>
                {safePrice(quote.totalPrice) !== null
                  ? <span className="price text-5xl text-[rgb(106,176,160)]">£{quote.totalPrice}</span>
                  : <span className="text-lg font-bold text-[rgb(106,176,160)] text-right">{PRICE_FALLBACK_TEXT}</span>}
              </div>
              <p className="mt-3 text-xs text-slate-400 font-medium">
                From your second clean, {tierName(quote.cleaningType)} is £{everyTurnoverPrice(quote.cleaningType, beds)} when booked within {EVERY_TURNOVER_WINDOW_DAYS} days of your last clean at the same property.
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center space-x-3 text-sm font-bold text-[rgb(106,176,160)]">
                <CheckCircle className="w-4 h-4" /> <span>Photo proof after every clean</span>
              </div>
              <p className="text-sm lg:text-xs text-slate-400 leading-relaxed">No payment now. We confirm your final price before any clean takes place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
