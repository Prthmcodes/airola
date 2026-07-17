import React from 'react';
import { Sparkles, BedDouble, UtensilsCrossed, Package, Camera, Siren, ArrowRight, MapPin } from 'lucide-react';
import { Page } from '../types';

interface AboutUsProps {
  onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
  const features = [
    { icon: <Sparkles className="w-7 h-7" />, title: 'Professional Turnover Cleaning', desc: 'Full guest-ready reset between every check-out and check-in.' },
    { icon: <Camera className="w-7 h-7" />, title: 'Photo Proof After Every Clean', desc: 'Photos to your WhatsApp before your guest arrives. Always.' },
    { icon: <BedDouble className="w-7 h-7" />, title: 'Linen Change & Bed Staging', desc: 'Fresh linen, hotel-style beds, laundry coordination.' },
    { icon: <UtensilsCrossed className="w-7 h-7" />, title: 'Dishwashing & Kitchen Reset', desc: 'Every dish, surface and appliance guest-ready.' },
    { icon: <Package className="w-7 h-7" />, title: 'Essentials Restocking', desc: 'Toilet paper, soap and basics topped up so guests never run out.' },
    { icon: <Siren className="w-7 h-7" />, title: 'Emergency Cleans', desc: 'Same-day rescue for our recurring clients when plans fall apart.' },
  ];

  return (
    <main className="bg-[rgb(249,239,239)]">
      {/* Hero */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[rgb(61,141,122)] font-black tracking-[0.2em] uppercase text-sm mb-4">About Us</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Built for Hosts Who Value <span className="text-[rgb(61,141,122)]">Peace of Mind</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                Airola was created to remove the stress from short-let turnovers in East London. We focus on reliability, clear pricing and photo proof after every clean. Whether you host one property or several, we make turnovers easy.
              </p>
              <div className="flex items-center text-slate-500 font-bold text-sm mb-10">
                <MapPin className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Stratford · Royal Wharf · Canary Wharf and nearby
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => onNavigate(Page.QUOTE)} className="px-8 py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-bold text-lg hover:bg-[rgb(45,110,95)] transition-all shadow-xl flex items-center justify-center">
                  Get a Quote <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button onClick={() => onNavigate(Page.CONTACT)} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                  Contact Us
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-[rgb(204,236,229)]/40 rounded-[3rem] blur-2xl"></div>
              <img
                src="/why-choose.jpg"
                alt="Airola cleaning professionals at work"
                className="relative rounded-[2.5rem] shadow-2xl w-full object-cover h-[420px] border border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 text-center">
            What We <span className="text-[rgb(61,141,122)]">Do</span>
          </h2>
          <p className="text-slate-500 text-center font-medium mb-14 max-w-xl mx-auto">Everything a short-let host needs between guests, done by one reliable team.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-[rgb(172,216,206)]/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-6 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110">
                  <div className="text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500">{f.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[rgb(45,110,95)] transition-colors">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
