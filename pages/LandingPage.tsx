
import React, { useState } from 'react';
import { Page } from '../types';
import { Sparkles, Calendar, ShoppingBag, CheckCircle, Star, ArrowRight, Gift, Trophy, Armchair, Shield, MessageCircle, Plus, Minus, Clock, Camera, MapPin } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[rgb(249,239,239)]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center pt-24 pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Professional cleaning team" 
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center 30%',
              filter: 'brightness(0.8)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-900/30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-lg animate-fade-up">
            Flawless Airbnb Turnovers <br className="hidden md:block" />
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
          </h1>
          <p className="text-xl text-slate-100 mb-10 max-w-2xl mx-auto leading-relaxed opacity-90 animate-fade-up fade-delay-1">
            Turnover cleaning for Airbnb hosts in East London. We clean, restock and send you photo proof after every job, so you never stress about check-in day again.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-up fade-delay-2">
            <button
              onClick={() => onNavigate(Page.QUOTE)}
              className="w-full sm:w-auto px-8 py-4 bg-[rgb(61,141,122)] text-white rounded-full font-bold text-lg hover:bg-[rgb(45,110,95)] transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(172,216,206,0.7)] hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Get My Price in 60 Seconds
            </button>
            <button 
              onClick={() => onNavigate(Page.PRICING)}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              View Cleaning Packages
            </button>
          </div>

          {/* Trust Strip */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-white/80 animate-fade-up fade-delay-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[rgb(172,216,206)]" />
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
        </div>
      </section>

      {/* Photo Proof Section */}
      <section className="pt-12 pb-4 bg-[rgb(249,239,239)] relative z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Camera className="w-64 h-64 -mr-20 -mt-20" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-[rgb(172,216,206)] text-xs font-black uppercase tracking-widest mb-6">
                  <Camera className="w-4 h-4 mr-2" /> Our Promise
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                  Photo proof after <span className="text-[rgb(172,216,206)]">every clean</span>
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  You see the result before your guest does. When we finish, we send photos straight to your WhatsApp: beds staged, kitchen reset, bathroom done. If we spot damage or low stock, you hear about it right away.
                </p>
                <button
                  onClick={() => onNavigate(Page.QUOTE)}
                  className="group flex items-center px-8 py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-black text-lg hover:bg-[rgb(45,110,95)] transition-all shadow-lg"
                >
                  Book Your First Clean <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
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
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
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
          <div className="bg-white rounded-[48px] p-8 md:p-16 relative overflow-hidden border border-[#f5f4f1] shadow-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              {/* Left Content */}
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                  Why Hosts <span className="text-[rgb(61,141,122)]">Trust</span> Airola
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  Professional standards of cleaning are efficient and reliable. Experienced cleaners with checked references who are trustworthy and discrete. Efficient office staff, easily contactable. 100% customer satisfaction.
                </p>
                <div className="flex items-center gap-4 text-[rgb(61,141,122)] font-bold">
                  <div className="w-12 h-1 bg-[rgb(106,176,160)] rounded-full" />
                  <span>Airola Excellence</span>
                </div>
              </div>

              {/* Right Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trust Card - Center Left */}
                <div className="md:mt-12 animate-pan-lr">
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#f5f4f1] hover:border-[rgb(172,216,206)]/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-default group">
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
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#f5f4f1] hover:border-[rgb(172,216,206)]/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-default group animate-pan-rl">
                    <div className="w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-6 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                      <Star className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[rgb(45,110,95)] transition-colors">Dedication</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Quality first. All projects are backed by our fanatic support & 100% satisfaction guarantee.
                    </p>
                  </div>

                  {/* Vision Card */}
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#f5f4f1] hover:border-[rgb(172,216,206)]/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-default group animate-pan-lr">
                    <div className="w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mb-6 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                      <MessageCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[rgb(45,110,95)] transition-colors">Vision</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Putting your needs first with seamless support and solutions that fit your goals.
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
                Why Airola: <br></br>Built for<span className="text-[rgb(61,141,122)]"> Hosts,</span> Not Households
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-medium mb-8">
                We're not a regular cleaning company. Airola is built for short-let hosts in East London who need reliability, speed and consistency. No long contracts. No confusing pricing. Just clean, guest-ready homes with photo proof every time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div className="p-4 rounded-2xl border border-transparent transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-[rgb(172,216,206)]/20">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mr-5 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110 mx-auto">
                    <CheckCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mt-2">No long contracts</h4>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-transparent transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-[rgb(172,216,206)]/20">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mr-5 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110 mx-auto">
                    <CheckCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mt-2">No confusing pricing</h4>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-transparent transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-[rgb(172,216,206)]/20">
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center mr-5 group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:scale-110 mx-auto">
                    <CheckCircle className="w-7 h-7 text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mt-2">Just clean, guest-ready homes</h4>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#faf9f7]/30 rounded-[40px] blur-2xl z-0 group-hover:bg-[#f5f4f1]/40 transition-colors"></div>
              <img 
                src="/why-choose.jpg" 
                alt="Professional cleaners at work" 
                className="rounded-[40px] shadow-lg relative z-10 w-full object-cover h-[500px] border border-[#f5f4f1] transition-transform duration-700"
              />
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
                  title: "Linen Change & Laundry Coordination", 
                  desc: "Bed stripping, fresh linen installation and coordination with your preferred laundry provider or ours.",
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
                  desc: "Rapid-response cleaning support for our recurring turnover clients when plans fall apart.",
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
                  className="bg-white p-6 rounded-2xl shadow-sm border border-[#f5f4f1] transition-all duration-300 group cursor-pointer flex items-center gap-6 hover:scale-105 hover:shadow-xl hover:-translate-y-1 hover:border-[rgb(172,216,206)]/50"
                >
                  <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                    <div className="text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500">
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
              <span className="text-[rgb(61,141,122)] font-black tracking-[0.2em] uppercase text-4xl mb-4 block text-center">SERVICES</span>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-8 md:p-16 relative overflow-hidden border border-[#f5f4f1] shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <span className="text-[rgb(61,141,122)] font-bold tracking-widest uppercase text-sm mb-4 block">STRUCTURED TURNOVER PROCESS</span>
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
                      desc: "Book per clean or activate Priority Host Access for discounted rates and priority scheduling.",
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
                      className="bg-white p-6 rounded-2xl shadow-sm border border-transparent transition-all duration-300 group cursor-pointer flex items-center gap-6 hover:scale-105 hover:shadow-xl hover:-translate-y-1 hover:border-[rgb(172,216,206)]/50"
                    >
                      <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-[rgb(235,247,244)] to-[rgb(204,236,229)] rounded-2xl flex items-center justify-center group-hover:from-[rgb(61,141,122)] group-hover:to-[rgb(45,110,95)] transition-all duration-500 shadow-sm group-hover:shadow-[rgb(172,216,206)]/50 group-hover:scale-110">
                        <div className="text-[rgb(61,141,122)] group-hover:text-white transition-colors duration-500">
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
                <img 
                  src="/how-works.jpg" 
                  alt="Cleaning professional using a vacuum on a sofa" 
                  className="rounded-3xl shadow-lg w-full h-full object-cover"
                />
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
              Where We <span className="text-[rgb(61,141,122)]">Work</span>
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
            <button onClick={() => onNavigate(Page.CONTACT)} className="px-5 py-2.5 bg-[rgb(235,247,244)] rounded-full border border-[rgb(172,216,206)] text-[rgb(45,110,95)] font-bold text-sm hover:bg-[rgb(204,236,229)] transition-colors">
              Close by? Ask us
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-[rgb(204,236,229)] shadow-md p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-[rgb(61,141,122)] to-[rgb(45,110,95)] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-black text-slate-900 mb-1">First-Clean Guarantee</h3>
              <p className="text-slate-600 font-medium">If your first clean isn't guest-ready, we come back and re-clean the affected areas free. That's how confident we are.</p>
            </div>
            <button onClick={() => onNavigate(Page.QUOTE)} className="shrink-0 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              Try Us Risk-Free
            </button>
          </div>
        </div>
      </section>

      {/* Giveaway Section */}
      <section className="pt-16 pb-4 bg-[rgb(249,239,239)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-[rgb(249,239,239)] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(61,141,122,0.15)] flex flex-col md:flex-row items-center justify-between text-slate-900 overflow-hidden relative border border-[rgb(172,216,206)]">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Gift className="w-64 h-64 -mr-20 -mt-20" />
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[rgb(61,141,122)]/10 text-[rgb(45,110,95)] text-xs font-black uppercase tracking-widest mb-6">
                <Trophy className="w-4 h-4 mr-2 text-[rgb(61,141,122)]" /> Launch Giveaway
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
                Win a <span className="text-[rgb(61,141,122)]">£1 turnover clean</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 font-medium leading-relaxed">
                To celebrate our launch, East London hosts can experience Airola for just £1.
                Tell us about your worst cleaning experience to enter.
              </p>
              <button
                onClick={() => onNavigate(Page.GIVEAWAY)}
                className="flex items-center px-8 py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-black text-lg hover:bg-[rgb(45,110,95)] transition-all shadow-lg"
              >
                Enter the Giveaway <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            <div className="mt-12 md:mt-0 grid grid-cols-1 gap-4 relative z-10">
              <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-[rgb(172,216,206)] shadow-md">
                <p className="text-xs font-bold text-[rgb(61,141,122)] uppercase tracking-wider mb-1">Grand Prize</p>
                <p className="text-2xl font-black text-[rgb(45,110,95)]">£1 Clean</p>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-[rgb(172,216,206)] shadow-md">
                <p className="text-xs font-bold text-[rgb(61,141,122)] uppercase tracking-wider mb-1">Runner-Up</p>
                <p className="text-2xl font-black text-slate-900">£25 Credit</p>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-[rgb(172,216,206)] shadow-md">
                <p className="text-xs font-bold text-[rgb(61,141,122)] uppercase tracking-wider mb-1">3rd Prize</p>
                <p className="text-2xl font-black text-slate-900">£15 Credit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[rgb(249,239,239)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl md:text-5xl font-black text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
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
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#f5f4f1] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                  {openFaq === i ? <Minus className="w-6 h-6 text-[rgb(61,141,122)]" /> : <Plus className="w-6 h-6 text-slate-500" />}
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-slate-600">
                    <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Still Have Questions Section */}
      <section className="pb-20 bg-[rgb(249,239,239)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Still have questions?</h2>
          <p className="text-slate-600 text-lg mb-8">Speak to our team today.</p>
          <button 
            onClick={() => onNavigate(Page.CONTACT)}
            className="px-8 py-4 bg-[rgb(61,141,122)] text-white rounded-full font-bold text-lg hover:bg-[rgb(45,110,95)] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
          >
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
