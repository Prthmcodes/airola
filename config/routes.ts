import { Page } from '../types';
import { AREA_PAGES, areaNeedsConfirmation } from './areas';

// Canonical host: the apex domain (non-www) serves the site directly. Canonicals, og:url and the sitemap all use it.
export const SITE_URL = 'https://airola.co.uk';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-bg.jpg`;

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  // Social-share text when it should differ from the meta description
  ogDescription?: string;
  noindex?: boolean;
}

// SEO: every page gets a real URL, title and description (titles <= 60 chars, descriptions <= 155)
export const PAGE_META: Record<Page, PageMeta> = {
  [Page.LANDING]: { path: '/', title: 'Airbnb Turnover Cleaning East London | Airola', description: 'Airbnb turnover cleaning in East London. Guest-ready resets with photo proof sent to your WhatsApp after every clean. Get your price in 60 seconds.', ogDescription: 'Flawless Airbnb turnovers, every check-out. Guest-ready cleaning, linen changes and restocking for short-let hosts in East London. Photo proof every clean.' },
  [Page.PRICING]: { path: '/pricing', title: 'Airbnb Cleaning Prices, From £45 | Airola', description: 'Turnover cleans from £45 (1-bed), +£20 per extra bedroom. Save £10 a clean when you book every turnover. No contract, photo proof every clean.' },
  [Page.QUOTE]: { path: '/quote', title: 'Get Your Turnover Clean Price in 60 Seconds | Airola', description: 'Instant price for your Airbnb turnover clean in East London. Choose bedrooms, package and add-ons. No payment now.' },
  [Page.REVIEW]: { path: '/quote/review', title: 'Review Your Quote | Airola', description: 'Confirm your Airbnb turnover cleaning quote.', noindex: true },
  [Page.GIVEAWAY]: { path: '/giveaway', title: 'Win a £1 Turnover Clean | Airola Giveaway', description: 'East London Airbnb hosts: enter free to win a full guest-ready turnover clean for £1. Closes Saturday 7 November 2026.' },
  [Page.ABOUT_US]: { path: '/about-us', title: 'About Airola | Airbnb Turnover Cleaners in East London', description: 'Airola is an East London team that does one thing: short-let turnovers, with photo proof to your WhatsApp after every clean.' },
  [Page.TESTIMONIALS]: { path: '/testimonials', title: 'Airbnb Host Reviews | Airola', description: "Reviews from East London Airbnb hosts on Airola's turnover cleaning, with photo proof after every clean. Cleaned with us? Leave your own review." },
  [Page.CONTACT]: { path: '/contact', title: 'Contact Airola | Airbnb Cleaning East London', description: 'Get in touch: WhatsApp, phone or email. Serving Stratford, Royal Wharf, Canary Wharf and nearby.' },
  [Page.LEGAL]: { path: '/legal', title: 'Terms, Privacy and Giveaway Rules | Airola', description: "Airola's terms and conditions, privacy policy, cookie policy and giveaway rules for our Airbnb turnover cleaning service in East London." },
  [Page.LOGIN]: { path: '/login', title: 'Host Login | Airola', description: 'Log in to manage your Airbnb turnover cleans.', noindex: true },
  [Page.DASHBOARD]: { path: '/dashboard', title: 'Host Hub | Airola', description: 'Manage your properties and turnover cleans.', noindex: true },
  [Page.ADMIN_DASHBOARD]: { path: '/admin', title: 'Command Center | Airola', description: 'Airola operations dashboard.', noindex: true },
  [Page.STAFF_MANAGEMENT]: { path: '/admin/team', title: 'Team | Airola', description: 'Airola team management.', noindex: true },
  [Page.ADD_PROPERTY]: { path: '/add-property', title: 'Register a Property | Airola', description: 'Add a listing to your Airola portfolio.', noindex: true },
  [Page.BONUS]: { path: '/giveaway/entered', title: "You're In | Airola Giveaway", description: 'Giveaway entry confirmed.' },
  [Page.THANKS]: { path: '/thanks', title: 'Thank You | Airola', description: 'Thanks from Airola.' },
  [Page.NOT_FOUND]: { path: '/404', title: 'Page Not Found | Airola', description: 'This page could not be found.', noindex: true },
  [Page.OFFER]: { path: '/offer', title: '10% Off Your First Turnover Clean | Airola', description: 'Web offer: 10% off your first Airbnb turnover clean in East London with code WEB10. From £45, photo proof every clean.', noindex: true },
  [Page.THANKS10]: { path: '/thanks10', title: '10% Off Your Next Clean | Airola', description: 'A thank-you for your review: 10% off your next Airbnb turnover clean with code THANKS10.', noindex: true },
  // Area pages stay noindex until every [CONFIRM] in config/areas.ts is filled in.
  [Page.AREA_STRATFORD]: { ...AREA_PAGES.stratford.meta, noindex: areaNeedsConfirmation(AREA_PAGES.stratford) },
  [Page.AREA_CANARY_WHARF]: { ...AREA_PAGES['canary-wharf'].meta, noindex: areaNeedsConfirmation(AREA_PAGES['canary-wharf']) },
  [Page.AREA_ROYAL_WHARF]: { ...AREA_PAGES['royal-wharf'].meta, noindex: areaNeedsConfirmation(AREA_PAGES['royal-wharf']) },
};

export const pathFor = (page: Page) => PAGE_META[page].path;

export const canonicalUrl = (path: string) => `${SITE_URL}${path}`;
