
import React, { useState } from 'react';
import { Page, Package } from '../types';
import { Check, Info, ArrowRight } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: Page) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [isMonthly, setIsMonthly] = useState(true);

  const packages: Package[] = [
    {
      name: "Standard Turnover",
      recommended: true,
      badge: "Most Popular",
      price: isMonthly ? "£35" : "£45",
      oldPrice: isMonthly ? "£45" : "",
      period: "/ clean",
      description: "The full guest-ready reset, with proof.",
      features: [
        "Full property turnover: kitchen, bathroom & floors",
        "Photo confirmation after every clean",
        "Damage & low-stock check",
        "Bed staging",
        "Priority booking & faster response",
        "No contract, no emergency fees"
      ],
      buttonText: "Book This Clean",
    },
    {
      name: "Guest-Ready Plus",
      price: isMonthly ? "£69" : "£79",
      oldPrice: isMonthly ? "£79" : "",
      period: "/ clean",
      description: "For a truly hands-off experience.",
      features: [
        "Everything in Standard Turnover",
        "Linen change & bed making",
        "Dishwashing & kitchen reset",
        "Inside fridge and cupboards",
        "Pre-check-in double inspection"
      ],
      buttonText: "Get Premium Turnover",
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Simple, Honest Pricing</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Prices below are for a 1-bedroom property. Add £20 per extra bedroom. Your exact price is confirmed before we clean.</p>
        </div>

        <div className="flex justify-center items-center space-x-4 mb-8">
          <span className={`font-medium ${!isMonthly ? 'text-slate-900' : 'text-slate-500'}`}>One-Off Clean</span>
          <label htmlFor="pricing-toggle" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="pricing-toggle" className="sr-only peer" checked={isMonthly} onChange={() => setIsMonthly(!isMonthly)} />
            <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[rgb(61,141,122)] hover:shadow-[0_0_10px_rgba(61,141,122,0.3)]"></div>
          </label>
          <span className={`font-medium ${isMonthly ? 'text-slate-900' : 'text-slate-500'}`}>Every Turnover (Save £10 per clean)</span>
        </div>

        {isMonthly && (
          <div className="text-center mb-12">
            <div className="inline-block bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-bold mb-2">
              Book every turnover with us — £10 off each clean
            </div>
            <p className="text-slate-500">No membership fee. No contract. Cancel anytime.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <div key={i} className={`group relative p-8 rounded-[3rem] border transition-all duration-500 hover:scale-[1.05] hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(61,141,122,0.15)] flex flex-col ${
              pkg.recommended 
                ? 'bg-white border-[rgb(172,216,206)] shadow-[0_32px_64px_-12px_rgba(61,141,122,0.25)] scale-105 z-10 ring-8 ring-[rgb(235,247,244)] py-12' 
                : 'bg-white border-slate-100 shadow-lg hover:border-[rgb(172,216,206)]/50'
            }`}>
              {pkg.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                  {pkg.badge}
                </div>
              )}
              {isMonthly && (
                <div className="absolute top-8 right-8 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Save £10
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-[rgb(61,141,122)] transition-colors">{pkg.name}</h3>
              
              <div className="flex flex-col mb-6">
                <div className="flex items-baseline group-hover:scale-105 transition-transform origin-left">
                  <span className="text-4xl font-extrabold text-slate-900">{pkg.price}</span>
                  {pkg.oldPrice && (
                    <span className="text-2xl text-slate-400 line-through ml-2">{pkg.oldPrice}</span>
                  )}
                  <span className="text-slate-500 ml-2 font-medium">{pkg.period}</span>
                </div>
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

              <div className="mt-auto">
                <button 
                  onClick={() => onNavigate(Page.QUOTE)}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-xl ${
                    pkg.recommended 
                      ? 'bg-[rgb(61,141,122)] text-white hover:bg-[rgb(45,110,95)] hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]' 
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  {pkg.buttonText || 'Check Availability'} <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
                </button>
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
            <div key={i} className="flex items-center text-slate-500 font-medium">
              <div className="w-1.5 h-1.5 bg-[rgb(172,216,206)] rounded-full mr-3"></div>
              {phrase}
            </div>
          ))}
        </div>

        <p className="text-center mb-16 text-slate-400 text-sm">
          Prices are for a 1-bedroom property. Add £20 per additional bedroom, on every package. A 2-bed Standard Turnover is £65.
        </p>

        {/* Win Your Money Back Section */}
        <div className="mb-32">
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(235,247,244)] rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-[rgb(61,141,122)] p-2 rounded-xl">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Host Loyalty Reward</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col justify-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1 h-full">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-[rgb(61,141,122)] font-bold">£25</div>
                    <div>
                      <div className="text-lg font-black mb-2">Loyalty Credit</div>
                      <p className="text-slate-600 text-sm">Rebook within 10 days to get £25 Cleaning credit</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[rgb(61,141,122)] rounded-[2rem] p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10">
                    <div className="text-lg font-black mb-2">Rewarding Consistent Hosts</div>
                    <p className="text-[rgb(235,247,244)] text-sm leading-relaxed">
                      We value long-term partnerships. That’s why returning hosts save more — automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">Credits apply to future bookings only. Not redeemable for cash.</p>
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
              Built Exclusively for <span className="text-[rgb(61,141,122)]">Short-Let</span> Hosts
            </h2>
            <div className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium space-y-8">
              <p>
                We specialise in fast, reliable turnover cleaning for Airbnb and serviced accommodation properties. No domestic cleaning. No corporate contracts. Just guest-ready resets done right.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base md:text-lg">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-[0_30px_60px_rgba(61,141,122,0.15)] hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-default group/card">
                  <p><span className="font-bold text-[rgb(61,141,122)] group-hover/card:text-[rgb(45,110,95)] transition-colors">Fast Turnarounds:</span><br></br> Same-day cleans between check-out and check-in.</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-[0_30px_60px_rgba(61,141,122,0.15)] hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-default group/card">
                  <p><span className="font-bold text-[rgb(61,141,122)] group-hover/card:text-[rgb(45,110,95)] transition-colors">Guest-Ready Standard:</span><br></br> Hotel-level reset, not just surface cleaning.</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-[0_30px_60px_rgba(61,141,122,0.15)] hover:-translate-y-3 hover:scale-105 transition-all duration-300 cursor-default group/card">
                  <p><span className="font-bold text-[rgb(61,141,122)] group-hover/card:text-[rgb(45,110,95)] transition-colors">Built Around Your Calendar:</span> We work around your bookings — not the other way around.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        


        {/* CTA Section */}
        <div className="mt-24">
          <div className="bg-[rgb(61,141,122)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group shadow-2xl shadow-[rgb(61,141,122)]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 transition-transform duration-700">Ready for a spotless property?</h2>
            <p className="text-[rgb(235,247,244)] text-xl mb-12 max-w-2xl mx-auto">We keep East London listings guest ready, with photo proof after every clean. Your first clean could be this week.</p>
            <button 
              onClick={() => onNavigate(Page.QUOTE)}
              className="px-10 py-5 bg-white text-[rgb(61,141,122)] rounded-full font-bold text-lg hover:bg-[rgb(235,247,244)] transition-all flex items-center mx-auto hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95"
            >
              Get My Price <ArrowRight className="ml-2 w-5 h-5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
