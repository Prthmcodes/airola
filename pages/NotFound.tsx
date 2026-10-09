import React from 'react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import ContactOptions from '../components/ContactOptions';

interface NotFoundProps {
  onNavigate: (page: Page) => void;
}

const linkClass =
  'inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-2xl font-bold text-base transition-colors';

const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => (
  <section className="max-w-2xl mx-auto px-4 py-20 text-center">
    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">We couldn't find that page</h1>
    <p className="text-lg text-slate-700 mb-8">It may have moved. Try one of these:</p>
    <nav aria-label="Helpful links" className="flex flex-wrap justify-center gap-3 mb-12">
      <RouteLink page={Page.LANDING} onNavigate={onNavigate} className={`${linkClass} bg-[#2D6E5F] text-white hover:bg-[#245A4E]`}>
        Home
      </RouteLink>
      <RouteLink page={Page.PRICING} onNavigate={onNavigate} className={`${linkClass} bg-white text-slate-900 border border-slate-200 hover:border-[#2D6E5F]`}>
        Pricing
      </RouteLink>
      <RouteLink page={Page.QUOTE} onNavigate={onNavigate} className={`${linkClass} bg-white text-slate-900 border border-slate-200 hover:border-[#2D6E5F]`}>
        Get a quote
      </RouteLink>
    </nav>
    <h2 className="text-xl font-bold text-slate-900 mb-4">Or contact us</h2>
    <ContactOptions />
  </section>
);

export default NotFound;
