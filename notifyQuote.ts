// Team alert (email + phone push) for a new quote, via the server-side function in api/notify-quote.ts.
// Fire-and-forget: never awaited, never throws, never shown to the customer.

export interface QuoteAlert {
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  address: string;
  beds: number;
  baths: number;
  cleaningType: string;
  frequency: string;
  addOns: string[];
  price: number | null;
  notes: string;
  ref?: string;
}

const TIMEOUT_MS = 5000;

// Same limits as the server, so a long note can't get the whole alert rejected.
const LIMITS: Partial<Record<keyof QuoteAlert, number>> = {
  name: 100, email: 254, phone: 40, propertyName: 120, address: 300, notes: 2000, ref: 40,
};
const clip = (alert: QuoteAlert): QuoteAlert => {
  const out: Record<string, unknown> = { ...alert };
  for (const [key, max] of Object.entries(LIMITS)) {
    if (typeof out[key] === 'string') out[key] = (out[key] as string).slice(0, max);
  }
  return out as unknown as QuoteAlert;
};

export const notifyNewQuote = (alert: QuoteAlert): void => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    fetch('/api/notify-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clip(alert)),
      signal: controller.signal,
      keepalive: true,
    })
      .then(res => { if (!res.ok) console.warn('Quote alert not sent:', res.status); })
      .catch(err => console.warn('Quote alert not sent:', err?.name || err))
      .finally(() => clearTimeout(timer));
  } catch (err) {
    console.warn('Quote alert not sent:', err);
  }
};
