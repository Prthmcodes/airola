// Packages, add-ons and discounts. One source for /pricing, /quote, the chatbot, area pages and JSON-LD,
// so a price is only ever changed here. Prices are for a 1-bedroom property.

export type Tier = 'standard' | 'premium';

// Base prices, 1-bedroom, one-off. Change prices here and nowhere else.
export const STANDARD_1BED = 55;
export const PREMIUM_1BED = 75;
export const EXTRA_BEDROOM = 20;
// Every-turnover saving per clean, from the second clean.
export const EVERY_TURNOVER_DISCOUNT = 5;

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

// Discounts. Only one applies to any clean.
export const EVERY_TURNOVER_SAVING = EVERY_TURNOVER_DISCOUNT;
export const EVERY_TURNOVER_WINDOW_DAYS = 30;
export const REBOOK_CREDIT = 10;
export const REBOOK_WINDOW_DAYS = 10;

export const tierName = (tier: string) => TIER_NAMES[tier as Tier] ?? TIER_NAMES.standard;

// One-off price: what a first clean always costs.
export const tierPrice = (tier: string, beds = 1) =>
  (TIER_BASE[tier as Tier] ?? TIER_BASE.standard) + EXTRA_BEDROOM * (Math.max(1, beds || 1) - 1);

// Price from the second clean, at the every-turnover rate.
export const everyTurnoverPrice = (tier: string, beds = 1) => tierPrice(tier, beds) - EVERY_TURNOVER_SAVING;

// First-clean total the quote flow charges: one-off price plus any Standard add-ons (Premium has none).
export const firstCleanTotal = (tier: string, beds = 1, addOnIds: readonly string[] = []) =>
  tierPrice(tier, beds) + (tier === 'premium' ? 0 :
    STANDARD_ADD_ONS.filter(a => addOnIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0));

export const EVERY_TURNOVER_RULE =
  `Your first clean is at the one-off price. From your second clean you save £${EVERY_TURNOVER_SAVING} per clean, as long as each clean is booked within ${EVERY_TURNOVER_WINDOW_DAYS} days of your last one at the same property.`;
export const REBOOK_RULE =
  `Rebook within ${REBOOK_WINDOW_DAYS} days of your first clean and get £${REBOOK_CREDIT} off your second clean.`;
export const REBOOK_NOT_COMBINED =
  `The £${REBOOK_CREDIT} replaces the £${EVERY_TURNOVER_SAVING} saving on that one clean; the two never combine. After that clean, the £${EVERY_TURNOVER_SAVING} every-turnover rate applies.`;
export const ONE_OFFER_RULE =
  'Only one offer applies per clean. Credits apply to future bookings only and cannot be exchanged for cash.';
