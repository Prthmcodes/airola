import React, { useState, useEffect } from 'react';
import { Page, User, AirolaNotification } from '../types';
import RouteLink from './RouteLink';
import { LogOut, Menu, X, LayoutDashboard, Bell, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onGoBack: () => void;
  notifications: AirolaNotification[];
  onToggleNotifications: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, user, onNavigate, onLogout, onGoBack, notifications, onToggleNotifications }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationsLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications';

  // Escape closes the mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const scrollToServices = () =>
    setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 100);

  // Real links (<a href>) so crawlers can follow them; RouteLink keeps in-app navigation on click.
  // wideOnly: shown in the desktop bar only from 1280px, where it fits; always in the mobile menu and footer.
  const links: { label: string; page: Page; hash?: string; after?: () => void; wideOnly?: boolean }[] = [
    { label: 'Home', page: Page.LANDING },
    { label: 'Packages', page: Page.PRICING },
    { label: 'Services', page: Page.LANDING, hash: 'services', after: scrollToServices },
    { label: 'Giveaway', page: Page.GIVEAWAY },
    { label: 'Reviews', page: Page.TESTIMONIALS, wideOnly: true },
    { label: 'About Us', page: Page.ABOUT_US },
  ];

  const isCurrent = (link: typeof links[number]) => !link.hash && currentPage === link.page;

  const dashboardPage = user.role === 'admin' ? Page.ADMIN_DASHBOARD : Page.DASHBOARD;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 h-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            {currentPage !== Page.LANDING && (
              <button
                onClick={onGoBack}
                className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors group"
                title="Go Back"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-[rgb(61,141,122)]" aria-hidden="true" />
              </button>
            )}
            <RouteLink page={Page.LANDING} onNavigate={onNavigate} className="flex items-center cursor-pointer rounded-xl" aria-label="Airola home">
              {/* Same logo artwork, resized to WebP for the 110px/160px slot; PNG stays as the fallback */}
              <picture className="contents">
                <source
                  type="image/webp"
                  srcSet="/images/logo-220.webp 220w, /images/logo-320.webp 320w, /images/logo-453.webp 453w"
                  sizes="(min-width: 768px) 160px, 110px"
                />
                <img
                  src="/Final_logo-removebg-preview.png"
                  alt=""
                  width={453}
                  height={367}
                  loading="lazy"
                  decoding="async"
                  className="w-[110px] md:w-[160px] h-auto transition-transform duration-300 ease-in-out hover:scale-105 p-3"
                />
              </picture>
            </RouteLink>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <RouteLink
                key={link.label}
                page={link.page}
                hash={link.hash}
                onNavigate={onNavigate}
                afterNavigate={link.after}
                className={`${isCurrent(link) ? 'text-[#2D6E5F]' : 'text-slate-600'} hover:text-[#2D6E5F] font-medium transition-all duration-300 ${link.wideOnly ? 'hidden xl:inline-flex' : 'inline-flex'} items-center min-h-[44px] px-1 rounded-lg`}
                aria-current={isCurrent(link) ? 'page' : undefined}
              >
                {link.label}
              </RouteLink>
            ))}

            <div className="flex items-center space-x-3">
              {user.isLoggedIn ? (
                <>
                  <button
                    onClick={onToggleNotifications}
                    className="relative w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Notifications"
                    aria-label={notificationsLabel}
                  >
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#2D6E5F] text-white text-xs font-black rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onNavigate(dashboardPage)}
                    className="flex items-center px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate(Page.LOGIN)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-700 border border-slate-200 hover:border-[rgb(172,216,206)] hover:text-[#2D6E5F] transition-all"
                >
                  Log In
                </button>
              )}
              <RouteLink
                page={Page.QUOTE}
                onNavigate={onNavigate}
                className="bg-[#2D6E5F] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#245A4E] transition-all shadow-lg shadow-[rgb(61,141,122)]/20 hover:scale-105 active:scale-95"
              >
                Get a Quote
              </RouteLink>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            {user.isLoggedIn && (
              <button className="relative text-slate-600 w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100" onClick={onToggleNotifications} title="Notifications" aria-label={notificationsLabel}>
                <Bell className="w-6 h-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-0.5 bg-[#2D6E5F] text-white text-xs font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button className="text-slate-600 w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-menu">
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden bg-white border-b border-slate-200 shadow-xl">
          <div className="px-6 py-4 space-y-1">
            {links.map(link => (
              <RouteLink
                key={link.label}
                page={link.page}
                hash={link.hash}
                onNavigate={onNavigate}
                onClick={() => setMobileOpen(false)}
                afterNavigate={link.after}
                aria-current={isCurrent(link) ? 'page' : undefined}
                className={`block w-full text-left px-4 py-3 rounded-xl font-bold ${isCurrent(link) ? 'text-[#2D6E5F] bg-[rgb(235,247,244)]' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {link.label}
              </RouteLink>
            ))}
            {user.isLoggedIn ? (
              <>
                <button
                  onClick={() => { setMobileOpen(false); onNavigate(dashboardPage); }}
                  className="block w-full text-left px-4 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setMobileOpen(false); onLogout(); }}
                  className="block w-full text-left px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); onNavigate(Page.LOGIN); }}
                className="block w-full text-left px-4 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
              >
                Log In
              </button>
            )}
            <RouteLink
              page={Page.QUOTE}
              onNavigate={onNavigate}
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-xl font-bold bg-[#2D6E5F] text-white mt-2"
            >
              Check Availability
            </RouteLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

