import React from 'react';
import { Camera, MessageCircle, Send, CalendarCheck } from 'lucide-react';

// Change the WhatsApp number here: digits only, with country code.
const AIROLA_WHATSAPP_NUMBER = '447925123219';
const OFFER_CODE = 'WEB10';
const CLAIM_MESSAGE = `Hi, I'd like to claim ${OFFER_CODE} for my first clean`;
const CLAIM_URL = `https://wa.me/${AIROLA_WHATSAPP_NUMBER}?text=${encodeURIComponent(CLAIM_MESSAGE)}`;

const steps = [
  { icon: MessageCircle, title: 'Tap the button', text: 'Tap "Claim on WhatsApp" below to open a chat with us.' },
  { icon: Send, title: 'Send the pre-filled message', text: `Your message already includes code ${OFFER_CODE}. Just hit send.` },
  { icon: CalendarCheck, title: 'We confirm your slot', text: 'Your booking is confirmed once the 50% deposit is received.' },
];

const OfferPage: React.FC = () => {
  return (
    <div className="bg-[rgb(249,239,239)] min-h-screen py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <p className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-widest mb-4 md:mb-6">
            <Camera className="w-4 h-4 mr-2" aria-hidden="true" /> Photo proof every clean
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight">
            <span className="text-[rgb(45,110,95)]">10% off</span> your first Airbnb turnover clean
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Standard Turnover from <strong className="text-slate-900">£45</strong>. Use the code below on your first booking.
          </p>
        </div>

        {/* Code + claim */}
        <section aria-labelledby="offer-code-heading" className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center mb-10">
          <h2 id="offer-code-heading" className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Your discount code</h2>
          <p className="inline-block px-8 py-4 mb-6 md:mb-8 rounded-2xl border-2 border-dashed border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-4xl md:text-5xl font-black tracking-[0.15em] text-[rgb(45,110,95)] font-mono">
            {OFFER_CODE}
          </p>
          <a
            href={CLAIM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-5 bg-[rgb(45,110,95)] text-white rounded-2xl font-black text-lg hover:bg-[rgb(33,84,72)] transition-all shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[rgb(45,110,95)]"
          >
            <MessageCircle className="w-6 h-6 mr-3" aria-hidden="true" />
            Claim on WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>

        {/* How to claim */}
        <section aria-labelledby="how-to-claim-heading" className="mb-10">
          <h2 id="how-to-claim-heading" className="text-2xl font-black text-slate-900 mb-6 text-center">How to claim</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={step.title} className="flex items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-md">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[rgb(235,247,244)] text-[rgb(45,110,95)] flex items-center justify-center mr-4">
                  <step.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">
                    <span className="text-[rgb(45,110,95)]">{i + 1}.</span> {step.title}
                  </h3>
                  <p className="text-slate-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Terms */}
        <section aria-labelledby="offer-terms-heading" className="text-sm text-slate-600 max-w-2xl mx-auto">
          <h2 id="offer-terms-heading" className="font-bold text-slate-700 mb-2">Terms</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>First clean only.</li>
            <li>Cannot be combined with other offers.</li>
            <li>Booking confirmed when the 50% deposit is received.</li>
            <li>Airola reserves the right to withdraw the offer.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default OfferPage;
