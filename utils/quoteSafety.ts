import { QuoteData } from '../types';
import { whatsappWithText } from '../components/ContactOptions';

// ---------- Price safety ----------

export const PRICE_FALLBACK_TEXT = "We'll confirm your price on WhatsApp";

// A price we can show, or null if it's NaN, missing or negative.
export const safePrice = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

// ---------- In-progress quote (sessionStorage) ----------

const DRAFT_KEY = 'airola.quoteDraft';

// Only keep fields whose type matches, so a stale or tampered draft can't crash the quote page.
const DRAFT_FIELDS: Record<string, 'string' | 'number' | 'boolean' | 'string[]'> = {
  propertyName: 'string', address: 'string', ownerName: 'string', ownerPhone: 'string', ownerEmail: 'string',
  notes: 'string', calendarUrl: 'string', cleaningType: 'string', frequency: 'string',
  beds: 'number', baths: 'number', basePrice: 'number', totalPrice: 'number', isPriorityHost: 'boolean', toiletries: 'string[]',
};

export const loadQuoteDraft = (): Partial<QuoteData> => {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const draft: Record<string, unknown> = {};
    for (const [key, type] of Object.entries(DRAFT_FIELDS)) {
      const v = parsed[key];
      const ok = type === 'string[]'
        ? Array.isArray(v) && v.every(x => typeof x === 'string')
        : type === 'number' ? Number.isFinite(v) : typeof v === type;
      if (ok) draft[key] = v;
    }
    return draft as Partial<QuoteData>;
  } catch {
    return {};
  }
};

export const saveQuoteDraft = (quote: QuoteData) => {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(quote));
  } catch {
    // Storage full or blocked (private mode): the quote still works, it just won't survive a reload.
  }
};

export const clearQuoteDraft = () => {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore: nothing to clear if storage is unavailable.
  }
};

// ---------- WhatsApp fallback ----------

const ADD_ON_NAMES: Record<string, string> = {
  essentials: 'Essentials Restocking',
  linen: 'Linen Change',
  dishwashing: 'Dishwashing',
  appliance: 'Fridge & Microwave',
};

// Pre-filled WhatsApp message carrying what the visitor already entered, so nothing is lost if sending fails.
export const quoteWhatsappLink = (quote: QuoteData, name?: string) => {
  const lines = [
    "Hi Airola, I tried to send a quote request on your website but it didn't go through. My details:",
    `Name: ${name || quote.ownerName || '-'}`,
    `Bedrooms: ${quote.beds}`,
    `Package: ${quote.cleaningType === 'premium' ? 'Guest-Ready Plus' : 'Standard Turnover'} (${quote.frequency === 'recurring' ? 'every turnover' : 'one-off'})`,
    `Add-ons: ${quote.toiletries.length ? quote.toiletries.map(id => ADD_ON_NAMES[id] || id).join(', ') : 'none'}`,
    `Area: ${quote.address || '-'}`,
  ];
  return whatsappWithText(lines.join('\n'));
};
