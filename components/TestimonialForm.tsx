import React, { useState } from 'react';
import { db, type TestimonialSubmitFailure } from '../db';
import { StarInput } from './StarRating';
import { whatsappWithText } from './ContactOptions';

const BODY_MIN = 20;
const BODY_MAX = 600;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// What the visitor sees for each kind of failure. Their review stays in the form either way.
const SEND_FAILED: Record<TestimonialSubmitFailure, string> = {
  duplicate: "You've already sent a review today. Thank you! If you need to change it, message us on WhatsApp.",
  invalid: "Something in the form didn't pass our checks. Please check your name, review length and the consent box, then try again.",
  unavailable: "Our review form isn't accepting reviews right now. Your review is still here: send it to us on WhatsApp and we'll add it for you.",
  network: "We couldn't reach our server. Please check your connection and try again, or send your review on WhatsApp.",
  unknown: "We couldn't send your review. Please try again, or send it to us on WhatsApp.",
};

type Field = 'displayName' | 'area' | 'rating' | 'body' | 'email' | 'consent';

const inputClass =
  'w-full p-4 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-[#2D6E5F] transition-colors font-medium text-slate-900 placeholder:text-slate-500 aria-[invalid=true]:border-red-600';
const labelClass = 'block text-sm font-bold text-slate-800 mb-2';

const TestimonialForm: React.FC<{ onSubmitted?: () => void }> = ({ onSubmitted }) => {
  const [displayName, setDisplayName] = useState('');
  const [area, setArea] = useState('');
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot: real visitors never see or fill this
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sendError, setSendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    const name = displayName.trim();
    if (name.length < 2 || name.length > 40) e.displayName = 'Please enter a name of 2 to 40 characters.';
    if (area.trim().length > 40) e.area = 'Please keep the area to 40 characters or fewer.';
    if (rating < 1 || rating > 5) e.rating = 'Please choose a star rating.';
    const len = body.trim().length;
    if (len < BODY_MIN) e.body = `Please write at least ${BODY_MIN} characters.`;
    else if (len > BODY_MAX) e.body = `Please keep your review to ${BODY_MAX} characters.`;
    if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (!consent) e.consent = 'Please tick the box so we can publish your review.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');
    const found = validate();
    setErrors(found);
    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      document.getElementById(`review-${firstInvalid}`)?.focus();
      return;
    }
    // Bots fill hidden fields. Pretend it worked so they don't retry.
    if (website) {
      setSent(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await db.submitTestimonial({ displayName, area, rating, body, email, consent });
      if (!result.success) {
        setSendError(SEND_FAILED[result.reason ?? 'unknown']);
        return;
      }
      setSent(true);
      onSubmitted?.();
    } catch (err) {
      console.error('[testimonials] submit threw:', err);
      setSendError(SEND_FAILED.network);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
        <p className="text-xl font-bold text-slate-900">Thank you! Your review will appear once we've checked it.</p>
      </div>
    );
  }

  const describe = (field: Field, hintId?: string) =>
    [hintId, errors[field] ? `review-${field}-error` : undefined].filter(Boolean).join(' ') || undefined;
  const errorText = (field: Field) =>
    errors[field] ? <p id={`review-${field}-error`} className="mt-2 text-sm font-bold text-red-700">{errors[field]}</p> : null;
  const bodyLength = body.trim().length;

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-10 space-y-6">
      <div>
        <label htmlFor="review-displayName" className={labelClass}>Your name as you'd like it shown</label>
        <p id="review-displayName-hint" className="text-sm text-slate-600 mb-2">First name and initial is fine, e.g. Sam K.</p>
        <input
          id="review-displayName"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          maxLength={40}
          autoComplete="name"
          required
          aria-invalid={!!errors.displayName}
          aria-describedby={describe('displayName', 'review-displayName-hint')}
          className={inputClass}
        />
        {errorText('displayName')}
      </div>

      <div>
        <label htmlFor="review-area" className={labelClass}>Area <span className="font-medium text-slate-600">(optional)</span></label>
        <input
          id="review-area"
          type="text"
          value={area}
          onChange={e => setArea(e.target.value)}
          maxLength={40}
          placeholder="e.g. Stratford"
          aria-invalid={!!errors.area}
          aria-describedby={describe('area')}
          className={inputClass}
        />
        {errorText('area')}
      </div>

      <div>
        <p id="review-rating-label" className={labelClass}>Stars</p>
        {/* Focus target for validation; the radios themselves are focusable inside */}
        <div id="review-rating" tabIndex={-1} className="focus:outline-none">
          <StarInput
            name="review-rating"
            value={rating}
            onChange={setRating}
            labelledBy="review-rating-label"
            describedBy={describe('rating')}
            invalid={!!errors.rating}
          />
        </div>
        {errorText('rating')}
      </div>

      <div>
        <label htmlFor="review-body" className={labelClass}>Your review</label>
        <textarea
          id="review-body"
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={BODY_MAX}
          rows={5}
          required
          aria-invalid={!!errors.body}
          aria-describedby={describe('body', 'review-body-count')}
          className={`${inputClass} min-h-[140px]`}
        />
        <p id="review-body-count" className="mt-2 text-sm text-slate-600" aria-live="polite">
          {bodyLength} / {BODY_MAX} characters{bodyLength < BODY_MIN ? ` (at least ${BODY_MIN})` : ''}
        </p>
        {errorText('body')}
      </div>

      <div>
        <label htmlFor="review-email" className={labelClass}>Email</label>
        <p id="review-email-hint" className="text-sm text-slate-600 mb-2">Never shown publicly. Used only to verify your review.</p>
        <input
          id="review-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={describe('email', 'review-email-hint')}
          className={inputClass}
        />
        {errorText('email')}
      </div>

      {/* Honeypot: hidden from people and assistive tech, left in place for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <div>
        <label htmlFor="review-consent" className="flex items-start gap-3 min-h-[44px] text-base text-slate-800 cursor-pointer">
          <input
            id="review-consent"
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            required
            aria-invalid={!!errors.consent}
            aria-describedby={describe('consent')}
            className="mt-1 w-5 h-5 shrink-0 accent-[#2D6E5F]"
          />
          I agree Airola may publish my review with the name above.
        </label>
        {errorText('consent')}
      </div>

      {sendError && (
        <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
          <p>{sendError}</p>
          <a
            href={whatsappWithText(`Hi Airola, here's my review (${rating || '?'} stars) from ${displayName.trim() || '-'}${area.trim() ? `, ${area.trim()}` : ''}:\n\n${body.trim()}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center min-h-[44px] px-5 py-2 rounded-xl bg-[#2D6E5F] text-white hover:bg-[#245A4E]"
          >
            Send it on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full min-h-[44px] py-4 bg-[#2D6E5F] text-white rounded-2xl font-black text-lg hover:bg-[#245A4E] transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Sending…' : 'Submit my review'}
      </button>
    </form>
  );
};

export default TestimonialForm;
