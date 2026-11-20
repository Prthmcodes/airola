import React from 'react';
import { Page, Package } from '../types';
import RouteLink from '../components/RouteLink';
import JsonLd from '../components/JsonLd';
import { SITE_URL } from '../config/routes';
import {
  TIER_BASE, TIER_NAMES, TIER_FEATURES, EXTRA_BEDROOM, STANDARD_ADD_ONS, STANDARD_ADD_ONS_TOTAL, PREMIUM_DIFFERENCE,
  REBOOK_DISCOUNT_PERCENT, REBOOK_SHORT, REBOOK_RULE, REBOOK_DETAIL, ONE_OFFER_RULE,
  tierPrice, rebookPrice, formatPrice,
} from '../config/pricing';
import { Check, Info, ArrowRight } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: Page) => void;
}

// Service + OfferCatalog for /pricing. Every figure here is shown on this page.
const offer = (name: string, price: number, description: string) => ({
  '@type': 'Offer',
  name,
  price: String(price),
  priceCurrency: 'GBP',
  description,
});

const PRICING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Airbnb turnover cleaning',
  serviceType: 'Short-let turnover cleaning',
  provider: { '@id': SITE_URL },
  areaServed: { '@type': 'Place', name: 'East London' },
  url: `${SITE_URL}/pricing`,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Turnover cleaning packages',
    itemListElement: [
      offer(TIER_NAMES.standard, TIER_BASE.standard, `One-off clean, price for a 1-bedroom property. Add £${EXTRA_BEDROOM} per extra bedroom.`),
      offer(TIER_NAMES.premium, TIER_BASE.premium, `One-off clean, price for a 1-bedroom property. Add £${EXTRA_BEDROOM} per extra bedroom.`),
      offer('Extra bedroom', EXTRA_BEDROOM, 'Added per extra bedroom, on every package.'),
    ],
  },
};

// What Premium's extras cost as Standard add-ons. Shown only when Premium is the better deal.
// The total comes from STANDARD_ADD_ONS in config/pricing.ts.
const PREMIUM_VALUE_LINE = STANDARD_ADD_ONS_TOTAL > PREMIUM_DIFFERENCE
  ? `As add-ons to Standard, dishwashing, fridge and microwave interior, and essentials restocking cost £${STANDARD_ADD_ONS_TOTAL} in total. Premium Turnover includes all ${STANDARD_ADD_ONS.length} for £${PREMIUM_DIFFERENCE} more.`
  : '';

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const packages: (Package & { tier: 'standard' | 'premium' })[] = [
    {
      tier: 'standard',
      name: TIER_NAMES.standard,
      price: `£${tierPrice('standard')}`,
      period: "/ clean",
      description: "The full guest-ready reset, with proof.",
      features: TIER_FEATURES.standard,
      buttonText: "Book Standard Turnover",
    },
    {
      tier: 'premium',
      name: TIER_NAMES.premium,
      recommended: true,
      badge: "Recommended",
      price: `£${tierPrice('premium')}`,
      period: "/ clean",
      description: "For a truly hands-off experience.",
      features: TIER_FEATURES.premium,
      buttonText: "Get Premium Turnover",
      smallText: PREMIUM_VALUE_LINE,
    }
  ];

  return (
    <div className="py-20">
      <JsonLd data={PRICING_SCHEMA} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Simple, Honest Pricing</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Prices below are for a 1-bedroom property. Add £{EXTRA_BEDROOM} per extra bedroom. Your exact price is confirmed before we clean.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <div key={i} className={`group relative p-6 sm:p-8 rounded-[3rem] border transition-all duration-500 md:hover:scale-[1.05] md:hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(61,141,122,0.15)] flex flex-col ${
              pkg.recommended 
                ? 'bg-white border-[rgb(172,216,206)] shadow-[0_32px_64px_-12px_rgba(61,141,122,0.25)] md:scale-105 z-10 ring-4 md:ring-8 ring-[rgb(235,247,244)] py-10 sm:py-12' 
                : 'bg-white border-slate-100 shadow-lg hover:border-[rgb(172,216,206)]/50'
            }`}>
              {pkg.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                  {pkg.badge}
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-[#2D6E5F] transition-colors">{pkg.name}</h2>
              
              <div className="flex flex-col mb-6">
                <div className="flex items-baseline group-hover:scale-105 transition-transform origin-left">
                  <span className="price text-4xl text-slate-900">{pkg.price}</span>
                  <span className="text-slate-500 ml-2 font-medium">{pkg.period}</span>
                </div>
                <p className="text-slate-600 text-sm mt-2 font-medium">{REBOOK_SHORT}</p>
                {pkg.description && (
                  <p className="text-slate-500 text-sm mt-2 font-medium">{pkg.description}</p>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {pkg.features.map((feature, j) => (
                  <li key={j} className="flex items-start group/item">
                    <div className="shrink-0 w-6 h-6 bg-[rgb(235,247,244)] rounded-full flex items-center justify-center mr-3 mt-1 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-[rgb(61,141,122)]">
                      <Check className="w-4 h-4 text-[rgb(61,141,122)] group-hover/item:text-white transition-colors" />
                    </div>
                    <span className="text-slate-600 text-sm leading-snug transition-colors group-hover/item:text-slate-900">{feature}</span>
                  </li>
                ))}
              </ul>

              {pkg.smallText && (
                <p className="text-sm text-[rgb(45,110,95)] bg-[rgb(235,247,244)] rounded-2xl px-4 py-3 mb-6 font-medium leading-snug">{pkg.smallText}</p>
              )}

              <div className="mt-auto">
                <RouteLink page={Page.QUOTE} onNavigate={onNavigate} 
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-xl ${
                    pkg.recommended 
                      ? 'bg-[#2D6E5F] text-white hover:bg-[#245A4E] hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]' 
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                  }`}>
                  {pkg.buttonText || 'Check Availability'} <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
                </RouteLink>
              </div>
            </div>
          ))}
        </div>
        


        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-20">
          {[
            "No long-term contracts",
            "Cancel anytime",
            "Final price confirmed before service",
            "Designed for Airbnb & short-let hosts"
          ].map((phrase, i) => (
            <div key={i} className="flex items-center text-slate-600 font-medium">
              <div className="w-1.5 h-1.5 bg-[rgb(172,216,206)] rounded-full mr-3"></div>
              {phrase}
            </div>
          ))}
        </div>

        <p className="text-center mb-16 text-slate-600 text-sm">
          Prices are for a 1-bedroom property. Add £{EXTRA_BEDROOM} per additional bedroom, on every package. A 2-bed Standard Turnover is £{tierPrice('standard', 2)}.
        </p>

        {/* The one offer: rebook discount. Only one offer applies per clean. */}
        <div className="mb-32">
          <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(235,247,244)] rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-[rgb(61,141,122)] p-2 rounded-xl">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Rebook discount</h2>
              </div>
              <div className="price inline-block bg-[rgb(235,247,244)] px-3 py-2 rounded-lg text-[#2D6E5F] mb-4">{REBOOK_DISCOUNT_PERCENT}% off</div>
              <p className="text-slate-700 leading-relaxed mb-3 font-medium">{REBOOK_RULE}</p>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{REBOOK_DETAIL}</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                For a 1-bed, that is £{formatPrice(rebookPrice('standard'))} for a {TIER_NAMES.standard} and £{formatPrice(rebookPrice('premium'))} for a {TIER_NAMES.premium}.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-4">{ONE_OFFER_RULE}</p>
        </div>

        {/* New Affordable Services Section */}
        <div className="mt-32 mb-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Decorative Arcs - Bottom Left */}
            <div className="absolute -left-20 -bottom-20 w-64 h-64 opacity-20 pointer-events-none z-0">
              <div className="absolute inset-0 border-[3px] border-[rgb(106,176,160)] rounded-full"></div>
              <div className="absolute -inset-8 border-[3px] border-[rgb(106,176,160)] rounded-full"></div>
              <div className="absolute -inset-16 border-[3px] border-[rgb(106,176,160)] rounded-full"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-10 leading-tight">
              Built Exclusively for <span className="text-[#2D6E5F]">Short-Let</span> Hosts
            </h2>
            <div className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium space-y-8">
              <p>
                We specialise in fast, reliable turnover cleaning for Airbnb and serviced accommodation properties. No domestic cleaning. No corporate contracts. Just guest-ready resets done right.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base md:text-lg">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-[0_30px_60px_rgba(61,141,122,0.15)] hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-default group/card">
                  <p><span className="font-bold text-[#2D6E5F] group-hover/card:text-[rgb(45,110,95)] transition-colors">Fast Turnarounds:</span><br></br> Same-day cleans between check-out and check-in. Subject to availability.</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-[0_30px_60px_rgba(61,141,122,0.15)] hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-default group/card">
                  <p><span className="font-bold text-[#2D6E5F] group-hover/card:text-[rgb(45,110,95)] transition-colors">Guest-Ready Standard:</span><br></br> Hotel-level reset, not just surface cleaning.</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-[0_30px_60px_rgba(61,141,122,0.15)] hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-default group/card">
                  <p><span className="font-bold text-[#2D6E5F] group-hover/card:text-[rgb(45,110,95)] transition-colors">Built Around Your Calendar:</span> We work around your bookings — not the other way around.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        


        {/* CTA Section */}
        <div className="mt-24">
          <div className="on-dark bg-[#2D6E5F] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group shadow-2xl shadow-[rgb(61,141,122)]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 transition-transform duration-700">Ready for a spotless property?</h2>
            <p className="text-[rgb(235,247,244)] text-xl mb-12 max-w-2xl mx-auto">We keep East London listings guest ready, with photo proof after every clean. Your first clean could be this week.</p>
            <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className="px-10 py-5 bg-white text-[#2D6E5F] rounded-full font-bold text-lg hover:bg-[rgb(235,247,244)] transition-all flex items-center mx-auto hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95">
              Get My Price <ArrowRight className="ml-2 w-5 h-5 transition-transform" />
            </RouteLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
