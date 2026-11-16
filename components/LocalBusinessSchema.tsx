import React from 'react';
import JsonLd from './JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '../config/routes';
import { AREA_PAGES } from '../config/areas';
import { TIER_NAMES, tierPrice } from '../config/pricing';
import { INSTAGRAM_URL } from '../config/promos';

// Sitewide LocalBusiness, rendered on every page (so it is in each prerendered snapshot).
// Areas, prices and profiles come from config, so they can't drift from the rest of the site.
// No Review or AggregateRating markup: the site has no third-party reviews to mark up.
// [CONFIRM: opening hours] Add openingHoursSpecification once hours are confirmed.
export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': SITE_URL,
  name: 'Airola',
  description: 'Airbnb and short-let turnover cleaning in East London with photo proof after every clean.',
  url: SITE_URL,
  telephone: '+447925123219',
  email: 'contact@airola.co.uk',
  image: DEFAULT_OG_IMAGE,
  logo: `${SITE_URL}/icon-512.png`,
  priceRange: '££',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Stratford, London',
    addressRegion: 'Greater London',
    addressCountry: 'GB',
  },
  areaServed: Object.values(AREA_PAGES).map(a => ({ '@type': 'Place', name: a.name })),
  makesOffer: [
    {
      '@type': 'Offer',
      name: TIER_NAMES.standard,
      price: String(tierPrice('standard')),
      priceCurrency: 'GBP',
      description: 'Guest-ready Airbnb turnover with linen change and bed making, damage and low-stock check and photo confirmation. Price for 1 bedroom.',
    },
    {
      '@type': 'Offer',
      name: TIER_NAMES.premium,
      price: String(tierPrice('premium')),
      priceCurrency: 'GBP',
      description: 'Everything in Standard plus dishwashing, inside fridge and microwave, essentials restocking, priority booking and pre-check-in double inspection. Price for 1 bedroom.',
    },
  ],
  sameAs: [INSTAGRAM_URL],
};

const LocalBusinessSchema: React.FC = () => <JsonLd data={LOCAL_BUSINESS_SCHEMA} />;

export default LocalBusinessSchema;
