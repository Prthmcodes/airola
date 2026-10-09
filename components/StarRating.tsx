import React from 'react';
import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5];

interface DisplayProps {
  value: number;
  size?: 'sm' | 'md';
}

// Read-only stars. Screen readers get "4 out of 5 stars" instead of five separate icons.
export const StarDisplay: React.FC<DisplayProps> = ({ value, size = 'sm' }) => {
  const px = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="inline-flex items-center gap-0.5">
      {STARS.map(n => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${px} ${n <= value ? 'fill-amber-400 text-amber-600' : 'fill-none text-slate-500'}`}
        />
      ))}
    </span>
  );
};

interface InputProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
}

// Star picker built on native radio inputs, so arrow keys, Tab and screen readers work as expected.
// Each star is a 44x44px target with a visible focus ring.
export const StarInput: React.FC<InputProps> = ({ name, value, onChange, labelledBy, describedBy, invalid }) => (
  <div
    role="radiogroup"
    aria-labelledby={labelledBy}
    aria-describedby={describedBy}
    aria-invalid={invalid || undefined}
    aria-required="true"
    className="flex items-center gap-1"
  >
    {STARS.map(n => (
      <label key={n} className="relative cursor-pointer">
        <input
          type="radio"
          name={name}
          value={n}
          checked={value === n}
          onChange={() => onChange(n)}
          className="peer sr-only"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        />
        <span className="flex items-center justify-center w-11 h-11 rounded-xl peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2D6E5F] hover:bg-[rgb(235,247,244)] transition-colors">
          <Star
            aria-hidden="true"
            className={`w-8 h-8 ${n <= value ? 'fill-amber-400 text-amber-600' : 'fill-none text-slate-500'}`}
          />
        </span>
      </label>
    ))}
  </div>
);
