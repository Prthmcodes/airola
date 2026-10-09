import React from 'react';
import { Camera, Check } from 'lucide-react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { AreaPage as AreaPageData, isPlaceholder } from '../config/areas';

interface AreaPageProps {
  area: AreaPageData;
  onNavigate: (page: Page) => void;
}

// Same prices and inclusions as /pricing and /quote.
const SERVICES = [
  { name: 'Standard Turnover', price: 'From £45', detail: 'Full guest-ready reset: kitchen, bathroom and floors, bed staging, damage and low-stock check.' },
  { name: 'Guest-Ready Plus', price: 'From £79', detail: 'Everything in Standard plus linen change, dishwashing and a pre-check-in double inspection.' },
];

const AreaPage: React.FC<AreaPageProps> = ({ area, onNavigate }) => {
  // Area-specific details only appear once they've been confirmed (see config/areas.ts).
  const localDetails = [area.local.propertyTypes, area.local.checkInNorms].filter(text => !isPlaceholder(text));

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Airbnb Turnover Cleaning in {area.name}</h1>
      <p className="text-lg text-slate-700 leading-relaxed mb-12">
        Airola does turnover cleaning for Airbnb and short-let hosts in {area.name} and across East London. We clean,
        restock and send you photo proof after every job, so your listing is guest-ready before check-in.
      </p>

      {localDetails.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Turnovers in {area.name}</h2>
          {localDetails.map(text => (
            <p key={text} className="text-slate-700 leading-relaxed mb-3">{text}</p>
          ))}
        </section>
      )}

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Services and prices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map(s => (
            <div key={s.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">{s.name}</h3>
              <p className="price text-2xl text-[#2D6E5F] my-2">{s.price}</p>
              <p className="text-slate-700 text-sm leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
        <ul className="mt-6 space-y-2 text-slate-700">
          {[
            'Prices are for a 1-bedroom property. Add £20 per extra bedroom.',
            'Book every turnover and save £10 per clean. No contract.',
            'Your exact price is confirmed before we clean.',
          ].map(line => (
            <li key={line} className="flex items-start">
              <Check className="w-5 h-5 mr-2 mt-0.5 text-[#2D6E5F] shrink-0" aria-hidden="true" /> {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
          <Camera className="w-6 h-6 mr-3 text-[#2D6E5F]" aria-hidden="true" /> Photo proof after every clean
        </h2>
        <p className="text-slate-700 leading-relaxed">
          When we finish, we send photos straight to your WhatsApp: beds staged, kitchen reset, bathroom done. If we
          spot damage or low stock, you hear about it right away. You see the result before your guest does.
        </p>
      </section>

      <div className="flex flex-col sm:flex-row gap-4">
        <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className="px-8 py-4 bg-[#2D6E5F] text-white rounded-2xl font-bold text-lg hover:bg-[#245A4E] transition-colors">
          Get My Price in 60 Seconds
        </RouteLink>
        <RouteLink page={Page.PRICING} onNavigate={onNavigate} className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:border-[#2D6E5F] transition-colors">
          See packages and prices
        </RouteLink>
      </div>
    </div>
  );
};

export default AreaPage;
