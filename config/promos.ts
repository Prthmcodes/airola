// Promotions switchboard. The giveaway opens and closes itself from these dates (UK time, with the
// Europe/London offset written out: +01:00 in British Summer Time, +00:00 after the clocks go back).
// Keep supabase/migrations/20261009000000_giveaway_close_guard.sql in step when the dates change.
export const GIVEAWAY_STARTS_AT = new Date('2026-10-10T00:00:00+01:00');
export const GIVEAWAY_ENDS_AT = new Date('2026-11-07T23:59:00+00:00');

export const GIVEAWAY_PROMOTER = 'Airola, contact@airola.co.uk';
export const GIVEAWAY_DRAW_METHOD = 'a random draw from all valid entries, made with a computer random-number generator';
export const GIVEAWAY_PRIZE_VALID_DAYS = 60;

export const isGiveawayOpen = (now = new Date()) =>
  now >= GIVEAWAY_STARTS_AT && now <= GIVEAWAY_ENDS_AT;

// e.g. "Saturday 7 November 2026, 11:59pm"
// Built from parts because browsers punctuate the full en-GB format differently.
export const formatUkDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(date);
  const p = (type: string) => parts.find((x: Intl.DateTimeFormatPart) => x.type === type)?.value ?? '';
  return `${p('weekday')} ${p('day')} ${p('month')} ${p('year')}, ${p('hour')}:${p('minute')}${p('dayPeriod').toLowerCase()}`;
};

export const INSTAGRAM_HANDLE = 'airola.uk';
export const INSTAGRAM_URL = 'https://www.instagram.com/airola.uk/';
export const INSTAGRAM_DM_URL = 'https://ig.me/m/airola.uk';
