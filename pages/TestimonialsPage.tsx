import React, { useEffect, useState } from 'react';
import { Testimonial } from '../types';
import { db } from '../db';
import TestimonialCard from '../components/TestimonialCard';
import TestimonialForm from '../components/TestimonialForm';

// The summary line only appears once there are enough reviews for an average to mean something.
const SUMMARY_MIN_REVIEWS = 3;

const TestimonialsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    db.getApprovedTestimonials()
      .then(rows => { if (!cancelled) { setReviews(rows); setStatus('ready'); } })
      .catch(err => { console.error(err); if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  // Computed from the approved rows on every load, never typed in.
  const count = reviews.length;
  const average = count ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">What East London hosts say</h1>
        <p className="text-lg text-slate-700">Honest reviews from hosts we've cleaned for.</p>
        {count >= SUMMARY_MIN_REVIEWS && (
          <p className="mt-4 text-lg font-bold text-slate-900">
            <span aria-hidden="true" className="text-amber-600">★</span> {average} from {count} host reviews
          </p>
        )}
      </header>

      {status === 'loading' && <p role="status" className="text-center text-slate-600 mb-12">Loading reviews…</p>}
      {status === 'error' && (
        <p role="status" className="text-center text-slate-700 mb-12">We couldn't load reviews right now. Please try again later.</p>
      )}
      {status === 'ready' && count === 0 && (
        <p className="text-center text-lg text-slate-700 mb-12">No reviews yet. If we've cleaned for you, we'd love an honest review.</p>
      )}
      {count > 0 && (
        <section aria-labelledby="reviews-heading" className="mb-16">
          <h2 id="reviews-heading" className="sr-only">Host reviews</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(r => (
              <li key={r.id}><TestimonialCard testimonial={r} /></li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="leave-review-heading" className="max-w-2xl mx-auto">
        <h2 id="leave-review-heading" className="text-2xl md:text-3xl font-black text-slate-900 mb-6 text-center">Leave a review</h2>
        <TestimonialForm />
      </section>
    </div>
  );
};

export default TestimonialsPage;
