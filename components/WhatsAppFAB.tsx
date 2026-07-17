import React from 'react';

const WhatsAppFAB: React.FC = () => {
  return (
    <a
      href="https://wa.me/447925123219"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-6 z-[100] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <img src="/whatsapp_logo_final.jpeg" alt="WhatsApp" className="w-16 h-16 rounded-full transition-all group-hover:brightness-95" />
      <span className="absolute right-20 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
        Chat with us!
      </span>
    </a>
  );
};

export default WhatsAppFAB;
