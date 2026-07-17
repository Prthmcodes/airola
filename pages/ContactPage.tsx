import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-black text-center mb-6 text-slate-900">Contact Us</h1>
      <p className="text-lg text-center mb-12 text-slate-600">
        Whether you have a question about our services, pricing, or anything else, our team is ready to help.
      </p>
      <div className="bg-white shadow-xl rounded-[2.5rem] p-8 md:p-12 border border-slate-100">
        <h2 className="text-2xl font-bold mb-8 text-slate-900">Get in Touch</h2>
        <div className="space-y-6">
          <a href="mailto:contact@airola.co.uk" className="flex items-center p-4 bg-slate-50 rounded-2xl hover:bg-[rgb(235,247,244)] transition-colors group">
            <Mail className="w-6 h-6 mr-4 text-[rgb(61,141,122)]" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</p>
              <p className="font-bold text-slate-900 group-hover:text-[rgb(45,110,95)]">contact@airola.co.uk</p>
            </div>
          </a>
          <a href="tel:+447925123219" className="flex items-center p-4 bg-slate-50 rounded-2xl hover:bg-[rgb(235,247,244)] transition-colors group">
            <Phone className="w-6 h-6 mr-4 text-[rgb(61,141,122)]" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone</p>
              <p className="font-bold text-slate-900 group-hover:text-[rgb(45,110,95)]">+44 7925 123219</p>
            </div>
          </a>
          <a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-slate-50 rounded-2xl hover:bg-[rgb(235,247,244)] transition-colors group">
            <MessageCircle className="w-6 h-6 mr-4 text-[rgb(61,141,122)]" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
              <p className="font-bold text-slate-900 group-hover:text-[rgb(45,110,95)]">Chat with us directly</p>
            </div>
          </a>
          <div className="flex items-center p-4 bg-slate-50 rounded-2xl">
            <MapPin className="w-6 h-6 mr-4 text-[rgb(61,141,122)]" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Area</p>
              <p className="font-bold text-slate-900">East London: Stratford, Royal Wharf, Canary Wharf and nearby</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
