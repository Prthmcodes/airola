
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { Sparkles, Calendar, ShoppingBag, CheckCircle, Star, ArrowRight, Gift, Trophy, Armchair, Shield, MessageCircle, Plus, Minus, Clock, Camera, MapPin, Instagram, PoundSterling, House } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { GIVEAWAY_ENDS_AT, isGiveawayOpen, formatUkDate, INSTAGRAM_URL, INSTAGRAM_DM_URL } from '../config/promos';
import IllustrativeLabel from '../components/IllustrativeLabel';
import { SITE_IMAGES } from '../config/images';
import SafeImage from '../components/SafeImage';
import JsonLd from '../components/JsonLd';
import TestimonialCard from '../components/TestimonialCard';
import TestimonialPreview, { isSamplePreview } from '../components/TestimonialPreview';
import { db } from '../db';
import { Testimonial } from '../types';

const whyLinkClass = 'inline-block text-left font-bold text-[#2D6E5F] underline underline-offset-2 hover:text-[#245A4E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6E5F] rounded-sm';

// True when the visitor has asked their OS for less motion.
const usePrefersReducedMotion = () => {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mql = window.matchMedia?.(query);
    if (!mql) return;
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
};

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

// Rendered in the FAQ section and reused for the FAQPage JSON-LD, so the two can't drift apart.
const FAQS = [
  {
    q: "How do I know the clean was done properly?",
    a: "We send photo confirmation to your WhatsApp after every clean: beds staged, kitchen reset, bathroom done. We also flag any damage or low stock we find. You see the result before your guest does."
  },
  {
    q: "Where do you operate?",
    a: "We're based in East London and focus on properties around Stratford, Royal Wharf, Canary Wharf and nearby areas. Keeping our patch small is how we stay fast and reliable."
  },
  {
    q: "How does turnover scheduling work?",
    a: "We schedule your clean based on your check-out and next check-in window. Our team ensures the property is reset, inspected and guest-ready before arrival."
  },
  {
    q: "What is included in a standard turnover clean?",
    a: "Full property reset including kitchen and bathroom cleaning, surface sanitisation, bed making, waste removal and final staging. Linen change and restocking can be added or included depending on your plan."
  },
  {
    q: "Do you offer discounts for regular cleans?",
    a: "Yes. Book every turnover with us and you save £10 on each clean, get priority scheduling in busy periods, and pay no emergency call-out fees. There is no membership charge and no contract. Cancel anytime."
  },
  {
    q: "Do you handle emergency same-day cleans?",
    a: "Yes. We offer emergency turnaround services subject to availability. Recurring clients get reduced or waived emergency fees."
  },
  {
    q: "Do you bring your own supplies?",
    a: "Yes. Our team arrives fully equipped. Essentials restocking can be added to your plan or managed under Auto Restock."
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const giveawayOpen = isGiveawayOpen();
  // Latest approved reviews. Until the first one is approved the section invites a review instead: no placeholders, no samples.
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  useEffect(() => {
    let cancelled = false;
    db.getApprovedTestimonials(3)
      .then(rows => { if (!cancelled) setReviews(rows); })
      .catch(err => console.error(err));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-[rgb(249,239,239)]">
      {/* Hero Section */}
      <section className="on-dark relative min-h-[80svh] flex items-center pt-10 pb-16 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2D6E5F] to-[#3D8D7A]">
          <SafeImage 
            {...SITE_IMAGES.hero}
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center 30%',
              filter: 'brightness(0.8)'
            }}
          />
          {/* Overlay keeps hero text at 4.5:1 or better over any part of the photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/80"></div>
          <IllustrativeLabel tone="dark" corner="left" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-[clamp(2.125rem,7.5vw+0.5rem,3rem)] md:text-7xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-lg animate-fade-up">
            Flawless Airbnb Turnovers <br className="hidden md:block" />
            {reducedMotion ? (
              <span className="text-[rgb(172,216,206)] whitespace-nowrap">Every Check-Out.</span>
            ) : (
              <>
                {/* Screen readers get one stable phrase instead of the retyping animation */}
                <span className="sr-only">Every Check-Out.</span>
                {/* The invisible copy of the longest phrase reserves its size, so the typing never shifts the layout */}
                <span aria-hidden="true" className="inline-grid whitespace-nowrap">
                  <span className="invisible col-start-1 row-start-1">Every Check-Out.|</span>
                  <span className="col-start-1 row-start-1">
                    <TypeAnimation
                      sequence={[
                        'Every Check-Out.',
                        3000,
                        'Every Time.',
                        3000,
                      ]}
                      wrapper="span"
                      cursor={true}
                      repeat={Infinity}
                      className="text-[rgb(172,216,206)]"
                    />
                  </span>
                </span>
              </>
            )}
          </h1>
          <p className="text-lg sm:text-xl text-slate-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed opacity-90 animate-fade-up fade-delay-1">
            Turnover cleaning for Airbnb hosts in East London. We clean, restock and send you photo proof after every job, so you never stress about check-in day again.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-up fade-delay-2">
            <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className="w-full sm:w-auto px-8 py-4 bg-[#2D6E5F] text-white rounded-full font-bold text-lg hover:bg-[#245A4E] transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(172,216,206,0.7)] hover:scale-105 hover:-translate-y-1 active:scale-95">
              Get My Price in 60 Seconds
            </RouteLink>
            <RouteLink page={Page.PRICING} onNavigate={onNavigate} className="px-2 py-2 text-white font-bold text-lg underline underline-offset-4 decoration-white/60 hover:decoration-white rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              See packages and prices
            </RouteLink>
          </div>
          <p className="mt-5 text-sm text-white/90 animate-fade-up fade-delay-2">
            No payment now · No contract · First-clean guarantee
          </p>

          {/* Trust Strip */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-white/90 animate-fade-up fade-delay-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[rgb(172,216,206)]" />
              {/* [CONFIRM: active public liability policy] */}
              <span className="font-medium text-sm">Fully Insured</span>
            </div>
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-[rgb(172,216,206)]" />
              <span className="font-medium text-sm">Photo Proof Every Clean</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[rgb(172,216,206)]" />
              <span className="font-medium text-sm">East London Based</span>
            </div>
          </div>

          {/* Secondary contact row */}
          <p className="mt-6 text-sm text-white/90 animate-fade-up fade-delay-3">
            Prefer a message?{' '}
            <a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm">
              WhatsApp us<span className="sr-only"> (opens in a new tab)</span>
            </a>
            {' '}or{' '}
            <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm">
              DM @airola.uk<span className="sr-only"> on Instagram (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </section>

      {/* Why Airola: five plain facts, each already stated elsewhere on the site */}
      <section aria-labelledby="why-airola-heading" className="pt-16 pb-4 bg-[rgb(249,239,239)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="why-airola-heading" className="text-3xl md:text-4xl font-black text-slate-900 mb-10 text-center">
            Why <span className="text-[#2D6E5F]">Airola</span>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: PoundSterling,
                title: 'Prices shown upfront',
                desc: 'From £45 for a 1-bed, plus £20 per extra bedroom. No emergency fees, and your final price is confirmed before we clean.',
                link: <RouteLink page={Page.PRICING} onNavigate={onNavigate} className={whyLinkClass}>See our prices</RouteLink>,
              },
              {
                icon: Camera,
                title: 'Photo proof after every clean',
                desc: 'Photos of each room go straight to your WhatsApp before your guest arrives.',
              },
              {
                icon: House,
                title: 'Airbnb turnovers only',
                desc: 'Built for short-let hosts in East London. No domestic or office cleaning, just guest-ready resets.',
              },
              {
                icon: Clock,
                title: 'Instant quote in about 60 seconds',
                desc: 'Choose your bedrooms, package and add-ons and see your price straight away. No payment now.',
                link: <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className={whyLinkClass}>Get your price</RouteLink>,
              },
              {
                icon: MessageCircle,
                title: 'Message us on WhatsApp',
                desc: 'Got a question about your property? Send us a message for a quick answer.',
                link: (
                  <a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className={whyLinkClass}>
                    WhatsApp us<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ),
              },
            ].map(({ icon: Icon, title, desc, link }) => (
              <li key={title} className="bg-white rounded-3xl p-6 border border-[#f5f4f1] shadow-sm flex flex-col">
                <div className="w-12 h-12 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-[rgb(61,141,122)]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                {link && <p className="mt-auto pt-4">{link}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Photo Proof Section */}
      <section className="pt-12 pb-4 bg-[rgb(249,239,239)] relative z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="on-dark bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Camera className="w-64 h-64 -mr-20 -mt-20" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-[rgb(172,216,206)] text-xs font-black uppercase tracking-[0.05em] mb-6">
                  <Camera className="w-4 h-4 mr-2" /> Our Promise
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                  Photo proof after <span className="text-[rgb(172,216,206)]">every clean</span>
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  You see the result before your guest does. When we finish, we send photos straight to your WhatsApp: beds staged, kitchen reset, bathroom done. If we spot damage or low stock, you hear about it right away.
                </p>
                <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className="group flex items-center px-8 py-4 bg-[#2D6E5F] text-white rounded-2xl font-black text-lg hover:bg-[#245A4E] transition-all shadow-lg">
                  Book Your First Clean <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </RouteLink>
              </div>

              <div className="space-y-4">
                {[
                  { n: '1', title: 'We clean and stage', desc: 'Full guest-ready reset between check-out and check-in.' },
                  { n: '2', title: 'You get photos on WhatsApp', desc: 'Every room, photographed and sent before your guest arrives.' },
                  { n: '3', title: 'Your guest walks into a spotless home', desc: 'Reviews protected. Nothing left to chance.' }
                ].map(step => (
                  <div key={step.n} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 bg-[rgb(61,141,122)] rounded-xl flex items-center justify-center font-black">{step.n}</div>
                    <div>
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="pt-4 pb-8 bg-[rgb(249,239,239)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-white rounded-[48px] p-5 sm:p-8 md:p-16 relative overflow-hidden border border-[#f5f4f1] shadow-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              {/* Left Content */}
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                  Why Hosts <span className="text-[#2D6E5F]">Trust</span> Airola
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  Airola is a small East London team that does one thing: short-let turnovers. Every clean ends with photos of each room sent to your WhatsApp before your guest arrives. If your first clean isn't guest-ready, we come back and re-clean the affected areas free.
                </p>
                <div className="flex items-center gap-4 text-[#2D6E5F] font-bold">
                  <div className="w-12 h-1 bg-[rgb(106,176,160)] rounded-full" />
                  <span>Airola Excellence</span>
                </div>
              </div>

              {/* Right Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trust Card - Center Left */}
                <div className="md:mt-12 animate-pan-lr">
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#f5f4f1] hover:border-[rgb(172,216,206)]/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-default group">
                    <div className="w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-6 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                      <Shield className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[rgb(45,110,95)] transition-colors">Trust</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      We keep our promises, provide upfront timelines and bring predictability.
                    </p>
                  </div>
                </div>

                {/* Vertical Stack for Dedication and Vision */}
                <div className="flex flex-col gap-6">
                  {/* Dedication Card */}
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#f5f4f1] hover:border-[rgb(172,216,206)]/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-default group animate-pan-rl">
                    <div className="w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-6 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                      <Star className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[rgb(45,110,95)] transition-colors">Dedication</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Quality first. Every clean is backed by photo proof and our First-Clean Guarantee.
                    </p>
                  </div>

                  {/* Vision Card */}
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#f5f4f1] hover:border-[rgb(172,216,206)]/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-default group animate-pan-lr">
                    <div className="w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-6 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                      <MessageCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[rgb(45,110,95)] transition-colors">Vision</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Built around your check-in window. We confirm your slot and your final price before every clean.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="pt-8 pb-20 bg-[rgb(249,239,239)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border-[20px] border-[rgb(106,176,160)] rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 pointer-events-none -translate-x-1/2 translate-y-1/2">
          <div className="w-full h-full border-[15px] border-[rgb(172,216,206)] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                Why Airola: <br></br>Built for<span className="text-[#2D6E5F]"> Hosts,</span> Not Households
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-medium mb-8">
                We're not a regular cleaning company. Airola is built for short-let hosts in East London who need reliability, speed and consistency. No long contracts. No confusing pricing. Just clean, guest-ready homes with photo proof every time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div className="p-4 rounded-2xl border border-transparent transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-[rgb(172,216,206)]/20">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110 mx-auto">
                    <CheckCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">No long contracts</h3>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-transparent transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-[rgb(172,216,206)]/20">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110 mx-auto">
                    <CheckCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">No confusing pricing</h3>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-transparent transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-[rgb(172,216,206)]/20">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110 mx-auto">
                    <CheckCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Just clean, guest-ready homes</h3>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#faf9f7]/30 rounded-[40px] blur-2xl z-0 group-hover:bg-[#f5f4f1]/40 transition-colors"></div>
              <SafeImage 
                {...SITE_IMAGES.why}
                loading="lazy"
                decoding="async"
                className="rounded-[40px] shadow-lg relative z-10 w-full object-cover h-[500px] border border-[#f5f4f1] transition-transform duration-700"
              />
              <IllustrativeLabel />
            </div>
          </div>
        </div>
      </section>

      

      {/* How It Works (Effortless Booking Section) */}
      <section id="services" className="py-24 bg-[rgb(249,239,239)] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Steps/Cards */}
            <div className="space-y-6 order-2 lg:order-1">
              {[
                { 
                  title: "Turnover Cleaning", 
                  desc: "Complete post-checkout reset including bathrooms, bedrooms, living areas and staging for next guest arrival.",
                  icon: <Calendar className="w-6 h-6" />,
                },
                { 
                  title: "Linen Change & Bed Making", 
                  desc: "Bed stripping, fresh linen fitted and beds staged. If your property has a washing machine we can wash sheets and towels on site. We don't offer an off-site laundry service.",
                  icon: <Shield className="w-6 h-6" />,
                },
                { 
                  title: "Essentials Restocking", 
                  desc: "Essential guest supplies topped up including toilet paper, hand wash, dish soap and bin liners. Optional premium amenity restocking available.",
                  icon: <Armchair className="w-6 h-6" /> ,
                },
                { 
                  title: "Kitchen Reset", 
                  desc: "Full kitchen reset including surface sanitisation, bin disposal and dishwashing. Fridge & microwave deep clean available as add-ons.",
                  icon: <Armchair className="w-6 h-6" /> ,
                },
                {
                  title: "Emergency Cleans",
                  desc: "Rapid-response cleaning support for our recurring turnover clients when plans fall apart. Subject to availability.",
                  icon: <Armchair className="w-6 h-6" /> ,
                },
                {
                  title: "Photo Confirmation",
                  desc: "Photos of every finished clean sent to your WhatsApp, plus damage and stock checks, so you always know your listing is guest-ready.",
                  icon: <Camera className="w-6 h-6" /> ,
                },
              ].map((step, i) => (
                <div 
                  key={i} 
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#f5f4f1] transition-all duration-300 group cursor-pointer flex items-center gap-4 sm:gap-6 hover:scale-105 hover:shadow-xl hover:-translate-y-1 hover:border-[rgb(172,216,206)]/50"
                >
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                    <div className="text-[#2D6E5F] group-hover:text-white transition-colors duration-500">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 transition-colors duration-300 group-hover:text-[rgb(45,110,95)]">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Content */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <span className="text-[#2D6E5F] font-black tracking-[0.2em] uppercase text-4xl mb-4 block text-center">SERVICES</span>
              <br></br>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight text-center">
                Everything Your Guests Expect - <br /> Delivered On Time
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  Every turnover is executed with structure and precision. From linen changes and kitchen resets to essentials restocking, we prepare your property exactly how guests expect it — and exactly when they arrive.
                </p>
                <p>
                 Designed for tight check-out and check-in windows, our process keeps your reviews protected and your calendar running smoothly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed How It Works Section */}
      <section className="pt-12 bg-[rgb(249,239,239)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-5 sm:p-8 md:p-16 relative overflow-hidden border border-[#f5f4f1] shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <span className="text-[#2D6E5F] font-bold tracking-[0.05em] uppercase text-sm mb-4 block">STRUCTURED TURNOVER PROCESS</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-10">How Airola Works</h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "1. Submit Your Property Details",
                      desc: "Provide your location, property size and any required add-ons. We prepare your custom turnover plan.",
                      icon: <Calendar className="w-6 h-6" />
                    },
                    {
                      title: "2. Select Your Turnover Plan",
                      desc: "Book a one-off clean at the standard rate. Book every turnover to save £10 per clean.",
                      icon: <ShoppingBag className="w-6 h-6" />
                    },
                    {
                      title: "3. We Execute On Schedule",
                      desc: "Our team completes the reset within your check-out window — ensuring your next guest walks into a flawless space.",
                      icon: <Armchair className="w-6 h-6" />
                    }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-transparent transition-all duration-300 group cursor-pointer flex items-center gap-4 sm:gap-6 hover:scale-105 hover:shadow-xl hover:-translate-y-1 hover:border-[rgb(172,216,206)]/50"
                    >
                      <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                        <div className="text-[#2D6E5F] group-hover:text-white transition-colors duration-500">
                          {item.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 transition-colors duration-300 group-hover:text-[rgb(45,110,95)]">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative h-full min-h-[300px] lg:min-h-0">
                <SafeImage 
                  {...SITE_IMAGES.how}
                  loading="lazy"
                  decoding="async"
                  className="rounded-3xl shadow-lg w-full h-full object-cover"
                />
                <IllustrativeLabel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas & Guarantee */}
      <section className="pt-16 pb-4 bg-[rgb(249,239,239)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Where We <span className="text-[#2D6E5F]">Work</span>
            </h2>
            <p className="text-slate-600 font-medium max-w-xl mx-auto">
              We keep our patch small on purpose. Staying local is how we hit tight check-in windows, every time.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['Stratford', 'Royal Wharf', 'Canary Wharf', 'Canning Town', 'Hackney Wick', 'Bow', 'Mile End', 'Leyton'].map(area => (
              <span key={area} className="px-5 py-2.5 bg-white rounded-full border border-[rgb(204,236,229)] text-slate-700 font-bold text-sm shadow-sm flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-2 text-[rgb(61,141,122)]" /> {area}
              </span>
            ))}
            <RouteLink page={Page.CONTACT} onNavigate={onNavigate} className="px-5 py-2.5 bg-[rgb(235,247,244)] rounded-full border border-[rgb(172,216,206)] text-[rgb(45,110,95)] font-bold text-sm hover:bg-[rgb(204,236,229)] transition-colors">
              Close by? Ask us
            </RouteLink>
          </div>

          <div className="bg-white rounded-[2rem] border border-[rgb(204,236,229)] shadow-md p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-[rgb(61,141,122)] to-[rgb(45,110,95)] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-black text-slate-900 mb-1">First-Clean Guarantee</h3>
              <p className="text-slate-600 font-medium">If your first clean isn't guest-ready, we come back and re-clean the affected areas free. That's how confident we are.</p>
            </div>
            <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className="shrink-0 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              Try Us Risk-Free
            </RouteLink>
          </div>
        </div>
      </section>

      {/* What hosts say: real, approved reviews only */}
      <section aria-labelledby="home-reviews-heading" className="pt-16 pb-4 bg-[rgb(249,239,239)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 id="home-reviews-heading" className="text-3xl md:text-4xl font-black text-slate-900 mb-10 text-center">
              What hosts say
            </h2>
            {/* Dev-only layout preview (?preview=1); stripped from production builds */}
            {import.meta.env.DEV && isSamplePreview() ? (
              <TestimonialPreview className="mb-8" />
            ) : reviews.length > 0 ? (
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {reviews.map(r => (
                    <li key={r.id}><TestimonialCard testimonial={r} /></li>
                  ))}
                </ul>
                <p className="text-center">
                  <RouteLink page={Page.TESTIMONIALS} onNavigate={onNavigate} className="inline-flex items-center min-h-[44px] font-bold text-[#2D6E5F] underline underline-offset-4 hover:text-[#245A4E]">
                    Read all reviews and leave yours
                  </RouteLink>
                </p>
              </>
            ) : (
              <div className="bg-white rounded-[2rem] border border-dashed border-[rgb(172,216,206)] p-8 sm:p-10 text-center max-w-2xl mx-auto">
                <Star className="w-8 h-8 mx-auto mb-4 text-[rgb(61,141,122)]" aria-hidden="true" />
                <p className="text-lg text-slate-700 mb-6">We're new, so there are no reviews here yet. If we've cleaned for you, we'd love an honest one.</p>
                <RouteLink page={Page.TESTIMONIALS} onNavigate={onNavigate} className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-[#2D6E5F] text-white rounded-2xl font-bold hover:bg-[#245A4E] transition-colors">
                  Leave a review
                </RouteLink>
              </div>
            )}
          </div>
        </section>

      {/* Giveaway Section */}
      <section className="pt-16 pb-4 bg-[rgb(249,239,239)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-[rgb(249,239,239)] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(61,141,122,0.15)] flex flex-col md:flex-row items-center justify-between text-slate-900 overflow-hidden relative border border-[rgb(172,216,206)]">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Gift className="w-64 h-64 -mr-20 -mt-20" />
            </div>

            {giveawayOpen ? (
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-[0.05em] mb-6">
                <Trophy className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Launch Giveaway
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
                Win a <span className="text-[#2D6E5F]">£1 turnover clean</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 font-medium leading-relaxed">
                East London hosts can enter free to win a full Standard Turnover for £1. Closes {formatUkDate(GIVEAWAY_ENDS_AT)}.
              </p>
              <RouteLink page={Page.GIVEAWAY} onNavigate={onNavigate} className="flex items-center px-8 py-4 bg-[#2D6E5F] text-white rounded-2xl font-black text-lg hover:bg-[#245A4E] transition-all shadow-lg">
                Enter the Giveaway <ArrowRight className="w-5 h-5 ml-2" />
              </RouteLink>
            </div>
            ) : (
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-[0.05em] mb-6">
                <Gift className="w-4 h-4 mr-2" aria-hidden="true" /> Giveaways
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
                Next giveaway coming soon
              </h2>
              <p className="text-slate-700 text-lg mb-8 font-medium leading-relaxed">
                Follow @airola.uk on Instagram to hear first.
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-[#2D6E5F] text-white rounded-2xl font-black text-lg hover:bg-[rgb(33,84,72)] transition-all shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#2D6E5F]"
              >
                <Instagram className="w-5 h-5 mr-2" aria-hidden="true" /> Follow @airola.uk
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            )}

            {giveawayOpen && (
            <div className="mt-12 md:mt-0 grid grid-cols-1 gap-4 relative z-10">
              <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-[rgb(172,216,206)] shadow-md">
                <p className="text-xs font-bold text-[#2D6E5F] uppercase tracking-wider mb-1">Grand Prize</p>
                <p className="price text-2xl text-[rgb(45,110,95)]">£1 Clean</p>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-[rgb(172,216,206)] shadow-md">
                <p className="text-xs font-bold text-[#2D6E5F] uppercase tracking-wider mb-1">Runner-Up</p>
                <p className="price text-2xl text-slate-900">£25 Credit</p>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-[rgb(172,216,206)] shadow-md">
                <p className="text-xs font-bold text-[#2D6E5F] uppercase tracking-wider mb-1">3rd Prize</p>
                <p className="price text-2xl text-slate-900">£15 Credit</p>
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[rgb(249,239,239)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl md:text-5xl font-black text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map(faq => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            }}
          />
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#f5f4f1] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-button-${i}`}
                  className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                  {openFaq === i ? <Minus className="w-6 h-6 text-[rgb(61,141,122)]" aria-hidden="true" /> : <Plus className="w-6 h-6 text-slate-500" aria-hidden="true" />}
                </button>
                {/* Kept in the page and toggled with `hidden`, so the answers are in the HTML */}
                <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} hidden={openFaq !== i} className="p-6 pt-0 text-slate-600">
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Still Have Questions Section */}
      <section className="pb-20 bg-[rgb(249,239,239)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Still have questions?</h2>
          <p className="text-slate-600 text-lg mb-8">Speak to our team today.</p>
          <RouteLink page={Page.CONTACT} onNavigate={onNavigate} className="px-8 py-4 bg-[#2D6E5F] text-white rounded-full font-bold text-lg hover:bg-[#245A4E] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]">
            Contact Us
          </RouteLink>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
