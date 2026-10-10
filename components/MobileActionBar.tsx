import React, { useEffect, useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { Page } from '../types';
import RouteLink from './RouteLink';
import WhatsAppIcon from './WhatsAppIcon';
import { WHATSAPP_URL } from './ContactOptions';

export const OPEN_CHAT_EVENT = 'airola:open-chat';

// Height of the bar without the safe area, used for the spacer that stops it covering the footer.
export const MOBILE_BAR_SPACER = 'md:hidden h-[calc(4.75rem+env(safe-area-inset-bottom))]';

const iconButton =
  'flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl border border-slate-200 bg-white text-slate-800 hover:border-[#2D6E5F] transition-colors';

// Phones only: one-tap quote, WhatsApp, call and chat, pinned to the bottom of the screen.
// Replaces the floating WhatsApp/chat buttons below 768px so nothing floats over page content.
const MobileActionBar: React.FC<{ currentPage: Page; onNavigate: (page: Page) => void }> = ({ currentPage, onNavigate }) => {
  const [typing, setTyping] = useState(false);

  // Hide while a text field has focus, so the on-screen keyboard never pushes the bar over the field.
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea, select');
    const onIn = (e: FocusEvent) => { if (isField(e.target)) setTyping(true); };
    const onOut = (e: FocusEvent) => { if (isField(e.target)) setTyping(false); };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  // On the quote flow the visitor is already getting a price.
  const showQuote = currentPage !== Page.QUOTE && currentPage !== Page.REVIEW;

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-[90] bg-white/95 backdrop-blur border-t border-slate-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform ${typing ? 'translate-y-full invisible' : ''}`}
    >
      <div className="flex items-center gap-2">
        {showQuote ? (
          <RouteLink
            page={Page.QUOTE}
            onNavigate={onNavigate}
            className="flex-1 flex items-center justify-center h-12 rounded-2xl bg-[#2D6E5F] text-white font-bold hover:bg-[#245A4E] transition-colors"
          >
            Get a Quote
          </RouteLink>
        ) : (
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#2D6E5F] text-white font-bold hover:bg-[#245A4E] transition-colors"
          >
            <WhatsAppIcon size={20} /> WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        {showQuote && (
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className={iconButton}>
            <WhatsAppIcon size={22} color="#1E9E50" />
          </a>
        )}
        <a href="tel:+447925123219" aria-label="Call +44 7925 123219" className={iconButton}>
          <Phone className="w-5 h-5" aria-hidden="true" />
        </a>
        <button type="button" aria-label="Chat with Airola assistant" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))} className={iconButton}>
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default MobileActionBar;
