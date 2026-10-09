import React from 'react';

interface IllustrativeLabelProps {
  // "dark" for labels sitting on a dark overlay, "light" for bright images.
  tone?: 'light' | 'dark';
  // Bottom corner to sit in; use "left" where floating buttons cover the right edge.
  corner?: 'left' | 'right';
}

// Small corner caption for AI-generated / illustrative imagery. Parent must be positioned.
const IllustrativeLabel: React.FC<IllustrativeLabelProps> = ({ tone = 'light', corner = 'right' }) => (
  <span
    className={`absolute bottom-4 ${corner === 'left' ? 'left-4' : 'right-4'} z-20 px-2 py-0.5 rounded-md text-xs font-medium pointer-events-none ${
      tone === 'dark' ? 'bg-slate-900/40 text-white/80' : 'bg-white/90 text-slate-500'
    }`}
  >
    Illustrative image
  </span>
);

export default IllustrativeLabel;
