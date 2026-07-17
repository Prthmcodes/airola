
import React from 'react';
import { Page } from '../types';

interface ThanksPageProps {
  onNavigate: (page: Page) => void;
}

export const ThanksPage: React.FC<ThanksPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Thanks!</h1>
      <p className="text-xl mb-8">Want £25 credit instantly? Rebook within 10 days.</p>
      <button 
        onClick={() => onNavigate(Page.LANDING)} 
        className="bg-green-500 text-white font-bold py-3 px-6 rounded hover:bg-green-600 transition-all hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
      >
        Back to Home
      </button>
    </div>
  );
};
