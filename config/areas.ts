// Location pages (/areas/...). Everything outside `local` reuses facts already on the site.
// `local` holds area-specific details. Each starts as a [CONFIRM: ...] placeholder: placeholders are
// never shown to visitors, and the page stays noindex (and out of the sitemap) until none remain.

export interface AreaPage {
  slug: string;
  name: string;
  meta: { path: string; title: string; description: string };
  local: {
    // e.g. typical property types you clean there
    propertyTypes: string;
    // e.g. usual check-out/check-in times you work to there
    checkInNorms: string;
  };
}

const area = (slug: string, name: string): AreaPage => ({
  slug,
  name,
  meta: {
    path: `/areas/${slug}`,
    title: `Airbnb Turnover Cleaning in ${name} | Airola`,
    description: `Airbnb turnover cleaning in ${name}, East London. From £45 (1-bed), photo proof sent to your WhatsApp after every clean.`,
  },
  local: {
    propertyTypes: `[CONFIRM: property types Airola cleans in ${name}]`,
    checkInNorms: `[CONFIRM: typical check-out and check-in windows in ${name}]`,
  },
});

export const AREA_PAGES = {
  stratford: area('stratford', 'Stratford'),
  'canary-wharf': area('canary-wharf', 'Canary Wharf'),
  'royal-wharf': area('royal-wharf', 'Royal Wharf'),
};

export const isPlaceholder = (text: string) => text.includes('[CONFIRM');

export const areaNeedsConfirmation = (a: AreaPage) => Object.values(a.local).some(isPlaceholder);
