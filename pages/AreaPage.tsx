import React from 'react';
import { Camera, Check } from 'lucide-react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { AreaPage as AreaPageData, AREA_PAGES, AREA_PAGE_IDS, isPlaceholder } from '../config/areas';
import JsonLd from '../components/JsonLd';
import { SITE_URL, canonicalUrl } from '../config/routes';
import { TIER_NAMES, tierPrice, EXTRA_BEDROOM, REBOOK_RULE } from '../config/pricing';

interface AreaPageProps {
  area: AreaPageData;
  onNavigate: (page: Page) => void;
}

// Same prices and inclusions as /pricing and /quote.
const SERVICES = [
  { name: TIER_NAMES.standard, price: `From £${tierPrice('standard')}`, detail: 'Full turnover of kitchen, bathroom and floors, linen change and bed making with your clean linen, bins emptied, damage and low-stock check.' },
  { name: TIER_NAMES.premium, price: `From £${tierPrice('premium')}`, detail: 'Everything in Standard plus dishwashing and kitchen reset, fridge cleaned inside and out and microwave inside, essentials restocked from your supplies, priority booking and a pre-check-in double inspection.' },
];

// Host guides linked from every area page.
const GUIDES = [
  { page: Page.BLOG_COST, label: 'How much does Airbnb turnover cleaning cost in London?' },
  { page: Page.BLOG_CHECKLIST, label: 'What should an Airbnb turnover clean include?' },
];

const LINK = 'font-bold text-[#2D6E5F] underline underline-offset-2 hover:text-[#245A4E]';

const AreaPage: React.FC<AreaPageProps> = ({ area, onNavigate }) => {
  const neighbours = (Object.keys(AREA_PAGES) as (keyof typeof AREA_PAGES)[])
    .filter(slug => slug !== area.slug)
    .map(slug => ({ page: AREA_PAGE_IDS[slug], name: AREA_PAGES[slug].name }));

  // Area-specific details only appear once they've been confirmed (see config/areas.ts).
  const localDetails = [area.local.propertyTypes, area.local.checkInNorms].filter(text => !isPlaceholder(text));

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: `Airbnb cleaning in ${area.name}`, item: canonicalUrl(area.meta.path) },
          ],
        }}
      />
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
            `Prices are for a 1-bedroom property. Add £${EXTRA_BEDROOM} per extra bedroom.`,
            `${REBOOK_RULE} No contract.`,
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

      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Nearby areas we cover</h2>
          <ul className="space-y-2 text-slate-700">
            {neighbours.map(n => (
              <li key={n.name}>
                <RouteLink page={n.page} onNavigate={onNavigate} className={LINK}>Airbnb turnover cleaning in {n.name}</RouteLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Guides for hosts</h2>
          <ul className="space-y-2 text-slate-700">
            {GUIDES.map(g => (
              <li key={g.label}>
                <RouteLink page={g.page} onNavigate={onNavigate} className={LINK}>{g.label}</RouteLink>
              </li>
            ))}
          </ul>
        </div>
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
