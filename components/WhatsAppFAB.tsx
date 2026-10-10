import React from 'react';
import WhatsAppIcon from './WhatsAppIcon';

// Tablet and desktop only; on phones the MobileActionBar carries WhatsApp.
const WhatsAppFAB: React.FC = () => {
  return (
    <a
      href="https://wa.me/447925123219"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-6 z-[100] w-14 h-14 rounded-full bg-[#25D366] shadow-2xl hidden md:flex items-center justify-center group transition-all hover:brightness-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#2D6E5F]"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon />
      <span className="absolute right-16 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
        Chat with us!
      </span>
    </a>
  );
};

export default WhatsAppFAB;
