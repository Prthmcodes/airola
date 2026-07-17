import React from 'react';
import { Page } from '../types';

interface BonusPageProps {
  onNavigate: (page: Page) => void;
}

export const BonusPage: React.FC<BonusPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[rgb(249,239,239)] text-gray-900 min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-5xl font-bold mb-4">You're In! 🎉</h1>
        <p className="text-xl mb-2">Thanks for entering the giveaway — we'll contact the winners directly.</p>
        <p className="text-lg text-slate-600 mb-10">Bonus: book within 10 days and get £25 credit towards your next clean.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate(Page.QUOTE)}
            className="px-8 py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-bold hover:bg-[rgb(45,110,95)] transition-all shadow-lg"
          >
            Book a Clean Now
          </button>
          <button
            onClick={() => onNavigate(Page.LANDING)}
            className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
