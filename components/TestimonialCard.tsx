import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { Testimonial } from '../types';
import { StarDisplay } from './StarRating';

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

// A published review, shown exactly as submitted. React escapes text, so any HTML in a review
// renders as plain characters; never use dangerouslySetInnerHTML here.
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial: t }) => (
  <figure className="relative h-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col">
    <span aria-hidden="true" className="absolute top-3 left-6 font-serif text-7xl leading-none text-[#2D6E5F] select-none">
      “
    </span>
    <div className="pt-10 mb-4">
      <StarDisplay value={t.rating} />
    </div>
    <blockquote className="flex-grow mb-6">
      <p className="font-serif italic text-lg text-slate-800 leading-relaxed whitespace-pre-line break-words">{t.body}</p>
    </blockquote>
    <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="font-bold text-slate-900">{t.displayName}</span>
      {t.area && <span className="text-slate-600">{t.area}</span>}
      <time dateTime={t.createdAt} className="text-slate-600">{monthYear(t.createdAt)}</time>
      {t.verified && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgb(235,247,244)] text-[#2D6E5F] text-xs font-bold">
          <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified customer
        </span>
      )}
    </figcaption>
  </figure>
);

export default TestimonialCard;
