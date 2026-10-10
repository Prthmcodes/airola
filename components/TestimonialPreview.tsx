import React from 'react';
import { Testimonial } from '../types';
import TestimonialCard from './TestimonialCard';

// DEV-ONLY design preview of the testimonials UI. Callers must guard every use with
// `import.meta.env.DEV &&` so the production build drops this module (and its sample text) entirely.
// These are not reviews: never write them to the database, never show them in production.

// Read once at load: the router rewrites the URL to the clean page path on mount, dropping the query string.
const PREVIEW_REQUESTED =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1';

export const isSamplePreview = () => PREVIEW_REQUESTED;

const SAMPLES: Testimonial[] = [
  {
    id: 'sample-a', createdAt: '2026-01-01T00:00:00Z', displayName: 'Sample Host A', area: 'Sample Area', rating: 5, verified: true,
    body: 'Placeholder review text for layout testing. This sample shows how a short review looks on the card.',
  },
  {
    id: 'sample-b', createdAt: '2026-01-01T00:00:00Z', displayName: 'Sample Host B', area: 'Sample Area', rating: 4, verified: false,
    body: 'Placeholder review text for layout testing. This sample is a little longer, to check how the card handles several lines of text and whether the cards in a row still line up neatly at the bottom.',
  },
  {
    id: 'sample-c', createdAt: '2026-01-01T00:00:00Z', displayName: 'Sample Host C', rating: 5, verified: false,
    body: 'Placeholder review text for layout testing.\nThis sample has a line break and no area.',
  },
];

// Same grid as the real list, with a badge on every card so a screenshot can't pass for real reviews.
const TestimonialPreview: React.FC<{ className?: string }> = ({ className = '' }) => (
  <ul className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {SAMPLES.map(t => (
      <li key={t.id} className="relative">
        <span className="absolute -top-3 right-6 z-10 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-[0.05em] shadow">
          SAMPLE – NOT REAL
        </span>
        <TestimonialCard testimonial={t} />
      </li>
    ))}
  </ul>
);

export default TestimonialPreview;
