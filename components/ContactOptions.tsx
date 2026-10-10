import React from 'react';
import { MessageCircle, Instagram, Phone, Mail } from 'lucide-react';
import { INSTAGRAM_DM_URL } from '../config/promos';

export const WHATSAPP_URL = 'https://wa.me/447925123219';

// WhatsApp link with a pre-filled message.
export const whatsappWithText = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;

const linkClass =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-2xl font-bold text-base bg-white text-slate-900 border border-slate-200 hover:border-[#2D6E5F] hover:text-[#2D6E5F] transition-colors';

// Every way to reach Airola that doesn't depend on the app working.
const ContactOptions: React.FC<{ whatsappHref?: string }> = ({ whatsappHref = WHATSAPP_URL }) => (
  <ul className="flex flex-wrap justify-center gap-3" aria-label="Contact options">
    <li>
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <MessageCircle className="w-5 h-5" aria-hidden="true" /> WhatsApp<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
    <li>
      <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <Instagram className="w-5 h-5" aria-hidden="true" /> Instagram DM<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
    <li>
      <a href="tel:+447925123219" className={linkClass}>
        <Phone className="w-5 h-5" aria-hidden="true" /> +44 7925 123219
      </a>
    </li>
    <li>
      <a href="mailto:contact@airola.co.uk" className={linkClass}>
        <Mail className="w-5 h-5" aria-hidden="true" /> contact@airola.co.uk
      </a>
    </li>
  </ul>
);

export default ContactOptions;
