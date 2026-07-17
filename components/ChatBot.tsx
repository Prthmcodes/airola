import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../types';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

interface ChatBotProps {
  onNavigate: (page: Page) => void;
}

interface Msg {
  from: 'bot' | 'user';
  text: string;
}

const TIER_BASE = { standard: 45, premium: 79 };
const priceFor = (tier: 'standard' | 'premium', beds: number, recurring: boolean) =>
  TIER_BASE[tier] + 20 * (Math.max(1, beds) - 1) - (recurring ? 10 : 0);

const AREAS = 'Stratford, Royal Wharf, Canary Wharf, Canning Town, Hackney Wick, Bow, Mile End and Leyton';

const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'bot', text: "Hi! I'm the Airola assistant. I can tell you prices, what's included, or where we work. What would you like to know?" }
  ]);
  const [chips, setChips] = useState<string[]>(['Pricing', "What's included?", 'Where do you work?', 'Photo proof?']);
  const [input, setInput] = useState('');
  const [awaitingBeds, setAwaitingBeds] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const bot = (text: string, nextChips: string[]) => {
    setMessages(prev => [...prev, { from: 'bot', text }]);
    setChips(nextChips);
  };

  const defaultChips = ['Pricing', "What's included?", 'Where do you work?', 'Get a quote'];

  const priceReply = (beds: number) => {
    const s = priceFor('standard', beds, false);
    const sr = priceFor('standard', beds, true);
    const p = priceFor('premium', beds, false);
    bot(
      `For a ${beds}-bed property: Standard Turnover is £${s} one-off (£${sr} if we do every turnover), and Guest-Ready Plus is £${p}. Both include photo proof after the clean. Final price is confirmed before we clean — no payment upfront on the site.`,
      ['Get a quote', "What's included?", 'Talk to a human']
    );
  };

  const handle = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    const q = text.toLowerCase();

    // Bedroom count expected
    if (awaitingBeds || /^[1-6]( bed(s|room)?s?)?$/.test(q)) {
      const n = parseInt(q, 10);
      if (!isNaN(n) && n >= 1 && n <= 6) {
        setAwaitingBeds(false);
        priceReply(n);
        return;
      }
    }

    if (/(price|pricing|cost|how much|quote|rate)/.test(q)) {
      setAwaitingBeds(true);
      bot('How many bedrooms does your property have?', ['1', '2', '3', '4']);
      return;
    }
    if (/(includ|what.*(do|does)|service|clean.*what|package)/.test(q)) {
      bot(
        'Every turnover includes a full guest-ready reset: kitchen, bathroom and floors, bed staging, a damage and low-stock check, and photos sent to your WhatsApp when we finish. Guest-Ready Plus adds linen change, dishwashing and a pre-check-in double inspection.',
        ['Pricing', 'Photo proof?', 'Get a quote']
      );
      return;
    }
    if (/(where|area|location|cover|stratford|canary|wharf|hackney|bow|leyton|mile end|canning)/.test(q)) {
      bot(
        `We're East London based and cover ${AREAS}. Close by but not listed? Message us — we can usually help.`,
        ['Pricing', 'Talk to a human', 'Get a quote']
      );
      return;
    }
    if (/(photo|proof|picture|how do i know|trust)/.test(q)) {
      bot(
        "After every clean we send photos straight to your WhatsApp: beds staged, kitchen reset, bathroom done. You see the result before your guest does. If we spot damage or low stock, you hear about it the same day.",
        ['Pricing', 'Get a quote']
      );
      return;
    }
    if (/(linen|laundry|bedding|sheets|towels)/.test(q)) {
      bot(
        'Yes — linen change and bed making is included in Guest-Ready Plus, or from £15 per bed as an add-on to any clean.',
        ['Pricing', 'Get a quote']
      );
      return;
    }
    if (/(emergency|same.?day|urgent|asap|today|tomorrow)/.test(q)) {
      bot(
        'We handle emergency and same-day cleans subject to availability, and recurring clients get priority. Fastest way is WhatsApp — tap below and we normally reply within minutes.',
        ['Talk to a human', 'Get a quote']
      );
      return;
    }
    if (/(book|quote|start|sign ?up)/.test(q)) {
      bot('Great — the quote takes about 60 seconds and shows your price live. Taking you there now!', defaultChips);
      setTimeout(() => { setOpen(false); onNavigate(Page.QUOTE); }, 900);
      return;
    }
    if (/(human|person|call|phone|whatsapp|talk|speak|contact)/.test(q)) {
      bot("Sure — tap the button below to chat with us directly on WhatsApp. We're quick to reply.", ['Get a quote']);
      setTimeout(() => window.open('https://wa.me/447925123219', '_blank', 'noopener'), 600);
      return;
    }
    if (/(giveaway|win|£1|prize)/.test(q)) {
      bot("We're running a launch giveaway — win a full turnover clean for £1! Taking you to the entry page.", defaultChips);
      setTimeout(() => { setOpen(false); onNavigate(Page.GIVEAWAY); }, 900);
      return;
    }
    // Fallback
    bot(
      "Good question — that one's best answered by the team. Tap 'Talk to a human' to reach us on WhatsApp, or try one of the options below.",
      ['Pricing', "What's included?", 'Talk to a human']
    );
  };

  const chipClick = (c: string) => handle(c);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    handle(input);
    setInput('');
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-slate-900 text-[rgb(106,176,160)] shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Chat with Airola assistant"
        >
          <MessageSquare className="w-7 h-7" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[110] w-[calc(100vw-3rem)] max-w-sm bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden" style={{ height: 'min(560px, calc(100vh - 8rem))' }}>
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[rgb(61,141,122)] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black leading-tight">Airola Assistant</p>
                <p className="text-[10px] text-[rgb(106,176,160)] font-bold uppercase tracking-widest">Instant answers</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/10 rounded-xl" aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-[rgb(61,141,122)] text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {chips.length > 0 && (
            <div className="px-4 pb-2 pt-2 flex flex-wrap gap-2 bg-slate-50/60 shrink-0">
              {chips.map(c => (
                <button
                  key={c}
                  onClick={() => chipClick(c)}
                  className="px-3 py-1.5 bg-white border border-[rgb(204,236,229)] text-[rgb(45,110,95)] rounded-full text-xs font-bold hover:bg-[rgb(235,247,244)] transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a question..."
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[rgb(106,176,160)]"
            />
            <button type="submit" className="px-4 bg-[rgb(61,141,122)] text-white rounded-xl hover:bg-[rgb(45,110,95)] transition-colors" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
