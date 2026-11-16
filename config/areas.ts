import { tierPrice } from './pricing';
import { Page } from '../types';

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
    description: `Airbnb turnover cleaning in ${name}, East London, from £${tierPrice('standard')} (1-bed). Photo proof sent to your WhatsApp after every clean. Get your price in 60 seconds.`,
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

// Route for each area page, for links between pages.
export const AREA_PAGE_IDS: Record<keyof typeof AREA_PAGES, Page> = {
  stratford: Page.AREA_STRATFORD,
  'canary-wharf': Page.AREA_CANARY_WHARF,
  'royal-wharf': Page.AREA_ROYAL_WHARF,
};
export const areaPageFor = (name: string): Page | undefined => {
  const slug = (Object.keys(AREA_PAGES) as (keyof typeof AREA_PAGES)[]).find(k => AREA_PAGES[k].name === name);
  return slug ? AREA_PAGE_IDS[slug] : undefined;
};

export const isPlaceholder = (text: string) => text.includes('[CONFIRM');

export const areaNeedsConfirmation = (a: AreaPage) => Object.values(a.local).some(isPlaceholder);
