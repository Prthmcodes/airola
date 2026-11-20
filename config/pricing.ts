// Packages, add-ons and discounts. One source for /pricing, /quote, the chatbot, area pages and JSON-LD,
// so a price is only ever changed here. Prices are for a 1-bedroom property.

export type Tier = 'standard' | 'premium';

// Base prices, 1-bedroom, one-off. Change prices here and nowhere else.
export const STANDARD_1BED = 55;
export const PREMIUM_1BED = 75;
export const EXTRA_BEDROOM = 20;

export const TIER_BASE: Record<Tier, number> = { standard: STANDARD_1BED, premium: PREMIUM_1BED };
export const TIER_NAMES: Record<Tier, string> = { standard: 'Standard Turnover', premium: 'Premium Turnover' };

// Includes, in the order shown on /pricing.
export const TIER_FEATURES: Record<Tier, string[]> = {
  standard: [
    'Full turnover of kitchen, bathroom and floors',
    'Linen change and bed making (using your clean linen)',
    'Bins emptied',
    'Damage and low-stock check',
    'Photo confirmation after every clean',
    'No contract',
  ],
  premium: [
    'Everything in Standard Turnover',
    'Dishwashing and kitchen reset',
    'Fridge cleaned inside and out, and microwave inside',
    'Essentials restocked from your supplies',
    'Priority booking and faster response',
    'Pre-check-in double inspection',
  ],
};

// Paid add-ons, Standard Turnover only (Premium Turnover already includes all three).
export const STANDARD_ADD_ONS = [
  { id: 'essentials', name: 'Essentials Restocking', price: 10, description: 'Toilet paper, hand soap, dish soap, bin liners' },
  { id: 'dishwashing', name: 'Dishwashing', price: 10, description: 'Complete kitchenware reset' },
  { id: 'appliance', name: 'Fridge & Microwave', price: 10, description: 'Deep interior clean' },
] as const;

export const ADD_ON_NAMES: Record<string, string> = Object.fromEntries(STANDARD_ADD_ONS.map(a => [a.id, a.name]));
export const STANDARD_ADD_ONS_TOTAL = STANDARD_ADD_ONS.reduce((sum, a) => sum + a.price, 0);
export const PREMIUM_DIFFERENCE = TIER_BASE.premium - TIER_BASE.standard;

// Rebook discount: the one offer. Change the window or percentage here and nowhere else.
// Eligibility is checked by the team when confirming a booking (see components/ActionQueue.tsx).
export const REBOOK_WINDOW_DAYS = 7;
export const REBOOK_DISCOUNT_PERCENT = 10;

// UK calendar day number, so "within 7 days" means by the date, not the hour.
const ukDayNumber = (d: Date) => {
  const [y, m, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(d).split('-').map(Number);
  return Date.UTC(y, m - 1, day) / 86_400_000;
};
// A clean qualifies if it is booked no later than REBOOK_WINDOW_DAYS after the date of the previous
// completed clean at the same property. Booking before that clean also counts.
export const qualifiesForRebook = (lastCleanCompletedAt: Date | string, bookedAt: Date | string) =>
  ukDayNumber(new Date(bookedAt)) - ukDayNumber(new Date(lastCleanCompletedAt)) <= REBOOK_WINDOW_DAYS;

export const tierName = (tier: string) => TIER_NAMES[tier as Tier] ?? TIER_NAMES.standard;

// One-off price: what a first clean always costs.
export const tierPrice = (tier: string, beds = 1) =>
  (TIER_BASE[tier as Tier] ?? TIER_BASE.standard) + EXTRA_BEDROOM * (Math.max(1, beds || 1) - 1);

// Clean price with the rebook discount, rounded to the penny.
export const rebookPrice = (tier: string, beds = 1) =>
  Math.round(tierPrice(tier, beds) * (100 - REBOOK_DISCOUNT_PERCENT)) / 100;

// Money for display: whole pounds as "55", anything with pence as "49.50".
export const formatPrice = (amount: number) => {
  const pennies = Math.round(amount * 100) / 100;
  return Number.isInteger(pennies) ? String(pennies) : pennies.toFixed(2);
};

// First-clean total the quote flow charges: one-off price plus any Standard add-ons (Premium has none).
export const firstCleanTotal = (tier: string, beds = 1, addOnIds: readonly string[] = []) =>
  tierPrice(tier, beds) + (tier === 'premium' ? 0 :
    STANDARD_ADD_ONS.filter(a => addOnIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0));

export const REBOOK_LABEL = `Rebook discount (${REBOOK_DISCOUNT_PERCENT}%)`;
export const REBOOK_SHORT = `${REBOOK_DISCOUNT_PERCENT}% off when you rebook within ${REBOOK_WINDOW_DAYS} days`;
export const REBOOK_RULE =
  `Book your next clean within ${REBOOK_WINDOW_DAYS} days of your last clean at the same property and take ${REBOOK_DISCOUNT_PERCENT}% off that clean. It applies every time you do.`;
export const REBOOK_DETAIL =
  `Your first clean at a property is at the full price. A clean qualifies if it is booked no later than ${REBOOK_WINDOW_DAYS} days after your last completed clean at the same property; booking before that clean also counts.`;
export const ONE_OFFER_RULE =
  'Only one offer applies per clean. The rebook discount does not combine with any other offer, private rate or giveaway credit. Credits apply to future bookings only and cannot be exchanged for cash.';
