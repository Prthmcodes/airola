import React from 'react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { WHATSAPP_URL } from '../components/ContactOptions';

interface BonusPageProps {
  onNavigate: (page: Page) => void;
}

export const BonusPage: React.FC<BonusPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[rgb(249,239,239)] text-gray-900 min-h-svh flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-5xl font-bold mb-4">You're in, good luck!</h1>
        <p className="text-xl mb-2">While you wait, get your turnover price in 60 seconds.</p>
        <p className="text-lg text-slate-600 mb-10">Bonus: book within 10 days and get £25 credit towards your next clean.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className="px-8 py-4 bg-[#2D6E5F] text-white rounded-2xl font-bold hover:bg-[#245A4E] transition-all shadow-lg">
            Get My Price in 60 Seconds
          </RouteLink>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            WhatsApp us<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
