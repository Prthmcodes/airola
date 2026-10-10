import React from 'react';
import { Page } from '../types';
import RouteLink from './RouteLink';

const Footer: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  // Real links (<a href>) so crawlers can follow them
  const link = (page: Page, label: string, hash?: string) => (
    <li>
      <RouteLink
        page={page}
        hash={hash}
        onNavigate={onNavigate}
        afterNavigate={hash ? () => setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 100) : undefined}
        className="inline-flex items-center min-h-[44px] md:min-h-0 md:inline-block md:py-1 text-left hover:text-white transition-colors"
      >
        {label}
      </RouteLink>
    </li>
  );

  return (
    <footer className="on-dark bg-[#2D6E5F] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Airola</h2>
            <p className="text-[rgb(204,236,229)] mb-4">
              Turnover cleaning for short-let and Airbnb hosts in East London.
            </p>
            {/* [CONFIRM: active public liability policy] */}
            <p className="text-[rgb(204,236,229)] text-sm">• Fully insured</p>
            <p className="text-[rgb(204,236,229)] text-sm">• Photo proof after every clean</p>
            <p className="text-[rgb(204,236,229)] text-sm">• Host-first service</p>
          </div>

          <div className="col-span-1">
            <h2 className="font-bold mb-4">Quick Links</h2>
            <ul className="space-y-1 md:space-y-2 text-[rgb(204,236,229)]">
              {link(Page.LANDING, 'Home')}
              {link(Page.PRICING, 'Packages')}
              {link(Page.LANDING, 'Services', 'services')}
              {link(Page.GIVEAWAY, 'Giveaway')}
              {link(Page.ABOUT_US, 'About')}
              {link(Page.TESTIMONIALS, 'Reviews')}
              {link(Page.CONTACT, 'Contact')}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 order-last md:order-none">
            <h2 className="font-bold mb-4">Contact</h2>
            <ul className="space-y-1 md:space-y-2 text-[rgb(204,236,229)]">
              <li><a href="mailto:contact@airola.co.uk" className="inline-flex items-center min-h-[44px] md:min-h-0 md:inline hover:text-white transition-colors">contact@airola.co.uk</a></li>
              <li><a href="tel:+447925123219" className="inline-flex items-center min-h-[44px] md:min-h-0 md:inline hover:text-white transition-colors">+44 7925 123219</a></li>
              <li><a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] md:min-h-0 md:inline hover:text-white transition-colors">WhatsApp us</a></li>
              <li>East London (Stratford), UK</li>
            </ul>
          </div>

          <div className="col-span-1">
            <h2 className="font-bold mb-4">Legal</h2>
            <ul className="space-y-1 md:space-y-2 text-[rgb(204,236,229)]">
              {link(Page.LEGAL, 'Privacy Policy')}
              {link(Page.LEGAL, 'Terms & Conditions')}
              {link(Page.LEGAL, 'Cookie Policy')}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-8 text-center text-[rgb(204,236,229)]">
          <p>© {new Date().getFullYear()} Airola. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
