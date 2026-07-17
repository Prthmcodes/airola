import React, { useState, useEffect } from 'react';
import { Page, QuoteData, User as UserType } from '../types';
import {
  ChevronRight, ChevronLeft, Sparkles, CheckCircle, Calendar as CalendarIcon,
  Link as LinkIcon, MapPin, ClipboardList, User, Phone, Mail, Shield, Star, Check,
  Package, BedDouble, UtensilsCrossed, Refrigerator, MessageCircle, Info
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
  const totalSteps = 2;

  const addOns = [
    { id: 'essentials', icon: <Package className="w-6 h-6" />, name: 'Essentials Restocking', priceText: '£10', price: 10, description: 'Toilet paper, hand soap, dish soap, bin liners' },
    { id: 'linen', icon: <BedDouble className="w-6 h-6" />, name: 'Linen Change', priceText: 'From £15', price: 15, description: 'Fresh linen, priced per bed' },
    { id: 'dishwashing', icon: <UtensilsCrossed className="w-6 h-6" />, name: 'Dishwashing', priceText: '£10', price: 10, description: 'Complete kitchenware reset' },
    { id: 'appliance', icon: <Refrigerator className="w-6 h-6" />, name: 'Fridge & Microwave', priceText: '£10', price: 10, description: 'Deep interior clean' }
  ];

  // Base prices are for a 1-bedroom property; +£20 per additional bedroom.
  // Hosts who book every turnover (recurring) save £10 per clean. No membership fee.
  const TIER_BASE: Record<string, number> = { starter: 39, standard: 45, premium: 79 };

  const tierPrice = (tier: string) => {
    const beds = Math.max(1, quote.beds || 1);
    return (TIER_BASE[tier] ?? 45) + 20 * (beds - 1) - (quote.frequency === 'recurring' ? 10 : 0);
  };

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

  // Live price
  useEffect(() => {
    const price = tierPrice(quote.cleaningType);
    const addOnsTotal = quote.toiletries.reduce((total, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      if (addonId === 'linen' && addon) return total + addon.price * (quote.beds || 1);
      return total + (addon ? addon.price : 0);
    }, 0);
    setQuote(prev => ({ ...prev, basePrice: price, totalPrice: price + addOnsTotal }));
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
            <p className="text-slate-500 font-medium tracking-wide">
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
                  <h3 className="text-2xl font-bold mb-6 text-slate-900">Your Property</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Bedrooms</label>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <button
                            key={n}
                            onClick={() => setQuote({ ...quote, beds: n })}
                            className={`w-14 h-14 rounded-2xl border-2 font-black text-lg transition-all ${
                              quote.beds === n ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-[rgb(61,141,122)] shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Bathrooms</label>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setQuote({ ...quote, baths: n })}
                            className={`w-14 h-14 rounded-2xl border-2 font-black text-lg transition-all ${
                              quote.baths === n ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-[rgb(61,141,122)] shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-300'
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Choose Your Clean</h3>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${quote.frequency === 'one-time' ? 'text-slate-900' : 'text-slate-400'}`}>One-off</span>
                      <label htmlFor="pricing-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="pricing-toggle" className="sr-only peer" checked={quote.frequency === 'recurring'} onChange={(e) => setQuote({ ...quote, frequency: e.target.checked ? 'recurring' : 'one-time' })} />
                        <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[rgb(61,141,122)]"></div>
                      </label>
                      <span className={`text-sm font-medium ${quote.frequency === 'recurring' ? 'text-slate-900' : 'text-slate-400'}`}>Every turnover (save £10)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { id: 'standard', name: 'Standard Turnover', icon: <Sparkles className="w-6 h-6" />, desc: 'Full guest-ready reset with photo confirmation, damage check and bed staging.' },
                      { id: 'premium', name: 'Guest-Ready Plus', icon: <Star className="w-6 h-6" />, desc: 'Everything in Standard plus linen change, dishwashing and pre-check-in double inspection. Fully hands-off.' }
                    ].map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setQuote({ ...quote, cleaningType: pkg.id as any })}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all relative group ${
                          quote.cleaningType === pkg.id
                            ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] shadow-xl'
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                          quote.cleaningType === pkg.id ? 'bg-[rgb(61,141,122)] text-white' : 'bg-white text-slate-400 shadow-sm'
                        }`}>
                          {pkg.icon}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">{pkg.name}</h4>
                        <p className="text-2xl font-black text-[rgb(61,141,122)] mb-2">£{tierPrice(pkg.id)}</p>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">{pkg.desc}</p>
                        {quote.cleaningType === pkg.id && (
                          <div className="absolute top-5 right-5 bg-[rgb(61,141,122)] text-white p-1 rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {quote.frequency === 'recurring' && (
                    <p className="mt-4 text-xs text-slate-500 font-medium flex items-center">
                      <Info className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Book every turnover with us and save £10 per clean, with priority scheduling and no emergency call-out fees. No membership charge. Cancel anytime.
                    </p>
                  )}
                </div>

                {/* Add-ons */}
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">Add-Ons <span className="text-sm font-medium text-slate-400">(optional)</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {addOns.map(addon => {
                      const selected = quote.toiletries.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                            selected ? 'bg-[rgb(235,247,244)] border-[rgb(61,141,122)] shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            selected ? 'bg-[rgb(61,141,122)] text-white' : 'bg-slate-50 text-[rgb(61,141,122)]'
                          }`}>
                            {addon.icon}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold ${selected ? 'text-[rgb(45,110,95)]' : 'text-slate-900'}`}>{addon.name}</h4>
                              <span className="text-xs font-black text-[rgb(61,141,122)]">{addon.priceText}</span>
                            </div>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">{addon.description}</p>
                          </div>
                          <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selected ? 'bg-[rgb(61,141,122)] border-[rgb(61,141,122)] text-white' : 'border-slate-200 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-2xl font-bold mb-8 text-slate-900">Where do we send your quote?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={quote.ownerName || ''} onChange={(e) => setQuote({ ...quote, ownerName: e.target.value })} placeholder="e.g. John Doe" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="email" value={quote.ownerEmail || ''} onChange={(e) => setQuote({ ...quote, ownerEmail: e.target.value })} placeholder="e.g. john@example.com" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="tel" value={quote.ownerPhone || ''} onChange={(e) => setQuote({ ...quote, ownerPhone: e.target.value })} placeholder="+44 7700 900000" className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Property Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea value={quote.address || ''} onChange={(e) => setQuote({ ...quote, address: e.target.value })} placeholder="Street address and postcode" className={`${inputClass} min-h-[90px]`} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Notes <span className="normal-case font-medium">(optional)</span></label>
                      <div className="relative">
                        <ClipboardList className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea value={quote.notes || ''} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} placeholder="Entry instructions, pets, anything we should know" className={`${inputClass} min-h-[90px]`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Airbnb Calendar Link <span className="normal-case font-medium">(optional)</span></label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="url" value={quote.calendarUrl || ''} onChange={(e) => setQuote({ ...quote, calendarUrl: e.target.value })} placeholder="https://www.airbnb.com/calendar/export/..." className={inputClass} />
                      </div>
                      <p className="mt-2 text-xs text-slate-400 flex items-start"><CalendarIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /> Share it and we auto-schedule cleans around your check-outs. We only see dates, never guest details.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stepError && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                {stepError}
              </div>
            )}

            <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button onClick={prevStep} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-400 hover:text-[rgb(61,141,122)] flex items-center transition-colors">
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
            <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-6">Your Price</h3>
            <div className="space-y-4 mb-8">
              {(user.isLoggedIn || quote.ownerName) && (
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase text-[rgb(106,176,160)] tracking-widest mb-1">Host</p>
                  <p className="text-sm font-bold truncate">{user.isLoggedIn ? user.name : quote.ownerName}</p>
                  <p className="text-xs text-slate-400 font-medium">{user.isLoggedIn ? user.email : quote.ownerEmail || ''}</p>
                </div>
              )}

              <div className="flex justify-between text-slate-400 font-medium text-sm">
                <span>
                  {quote.cleaningType === 'premium' ? 'Guest-Ready Plus' : 'Standard Turnover'} ({quote.beds} bed{quote.beds > 1 ? 's' : ''}, {quote.baths} bath{quote.baths > 1 ? 's' : ''})
                </span>
                <span className="text-white">£{quote.basePrice}</span>
              </div>

              {quote.frequency === 'recurring' && (
                <div className="flex justify-between text-[rgb(106,176,160)] font-medium text-sm">
                  <span>Recurring turnover discount</span>
                  <span>−£10 applied</span>
                </div>
              )}

              {quote.toiletries.map(addonId => {
                const addon = addOns.find(a => a.id === addonId);
                if (!addon) return null;
                const actualPrice = addon.id === 'linen' ? addon.price * (quote.beds || 1) : addon.price;
                return (
                  <div key={addonId} className="flex justify-between text-slate-400 font-medium text-xs">
                    <span>{addon.name} {addon.id === 'linen' && `(${quote.beds} bed${quote.beds > 1 ? 's' : ''})`}</span>
                    <span className="text-white">£{actualPrice}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-8 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Per Turnover</span>
                <span className="text-5xl font-black text-[rgb(106,176,160)]">£{quote.totalPrice}</span>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center space-x-3 text-sm font-bold text-[rgb(106,176,160)]">
                <CheckCircle className="w-4 h-4" /> <span>Photo proof after every clean</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">No payment now. We confirm your final price before any clean takes place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
