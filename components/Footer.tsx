import React from 'react';
import { Page } from '../types';

const Footer: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const link = (page: Page, label: string) => (
    <li>
      <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(page); }} className="hover:text-white transition-colors">
        {label}
      </a>
    </li>
  );

  return (
    <footer className="bg-[rgb(61,141,122)] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Airola</h3>
            <p className="text-[rgb(204,236,229)] mb-4">
              Turnover cleaning for short-let and Airbnb hosts in East London.
            </p>
            <p className="text-[rgb(204,236,229)] text-sm">• Fully insured</p>
            <p className="text-[rgb(204,236,229)] text-sm">• Photo proof after every clean</p>
            <p className="text-[rgb(204,236,229)] text-sm">• Host-first service</p>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[rgb(204,236,229)]">
              {link(Page.LANDING, 'Home')}
              {link(Page.PRICING, 'Packages')}
              {link(Page.LANDING, 'Services')}
              {link(Page.GIVEAWAY, 'Giveaway')}
              {link(Page.ABOUT_US, 'About')}
              {link(Page.CONTACT, 'Contact')}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-[rgb(204,236,229)]">
              <li><a href="mailto:contact@airola.co.uk" className="hover:text-white transition-colors">contact@airola.co.uk</a></li>
              <li><a href="tel:+447925123219" className="hover:text-white transition-colors">+44 7925 123219</a></li>
              <li><a href="https://wa.me/447925123219" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp us</a></li>
              <li>East London (Stratford), UK</li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-[rgb(204,236,229)]">
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
