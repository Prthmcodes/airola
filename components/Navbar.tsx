import React, { useState } from 'react';
import { Page, User, AirolaNotification } from '../types';
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

  const links: { label: string; page?: Page; action?: () => void }[] = [
    { label: 'Home', page: Page.LANDING },
    { label: 'Packages', page: Page.PRICING },
    {
      label: 'Services',
      action: () => {
        if (currentPage === Page.LANDING) {
          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          onNavigate(Page.LANDING);
          setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    },
    { label: 'Giveaway', page: Page.GIVEAWAY },
    { label: 'About Us', page: Page.ABOUT_US },
  ];

  const go = (link: typeof links[number]) => {
    setMobileOpen(false);
    if (link.action) link.action();
    else if (link.page) onNavigate(link.page);
  };

  const dashboardPage = user.role === 'admin' ? Page.ADMIN_DASHBOARD : Page.DASHBOARD;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 h-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            {currentPage !== Page.LANDING && (
              <button
                onClick={onGoBack}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-[rgb(61,141,122)]" />
              </button>
            )}
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate(Page.LANDING)}>
              <img
                src="/Final_logo-removebg-preview.png"
                alt="Airola Logo"
                className="w-[110px] md:w-[160px] h-auto transition-transform duration-300 ease-in-out hover:scale-105 p-3"
              />
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <button
                key={link.label}
                onClick={() => go(link)}
                className={`${link.page && currentPage === link.page ? 'text-[rgb(61,141,122)]' : 'text-slate-600'} hover:text-[rgb(61,141,122)] font-medium transition-all duration-300`}
              >
                {link.label}
              </button>
            ))}

            <div className="flex items-center space-x-3">
              {user.isLoggedIn ? (
                <>
                  <button
                    onClick={onToggleNotifications}
                    className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[rgb(61,141,122)] text-white text-[10px] font-black rounded-full flex items-center justify-center">
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
                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate(Page.LOGIN)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-700 border border-slate-200 hover:border-[rgb(172,216,206)] hover:text-[rgb(61,141,122)] transition-all"
                >
                  Log In
                </button>
              )}
              <button
                onClick={() => onNavigate(Page.QUOTE)}
                className="bg-[rgb(61,141,122)] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[rgb(45,110,95)] transition-all shadow-lg shadow-[rgb(61,141,122)]/20 hover:scale-105 active:scale-95"
              >
                Get a Quote
              </button>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            {user.isLoggedIn && (
              <button className="relative text-slate-600 p-2 rounded-full hover:bg-slate-100" onClick={onToggleNotifications} title="Notifications">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-0.5 bg-[rgb(61,141,122)] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button className="text-slate-600 p-2 rounded-full hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl">
          <div className="px-6 py-4 space-y-1">
            {links.map(link => (
              <button
                key={link.label}
                onClick={() => go(link)}
                className={`block w-full text-left px-4 py-3 rounded-xl font-bold ${link.page && currentPage === link.page ? 'text-[rgb(61,141,122)] bg-[rgb(235,247,244)]' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {link.label}
              </button>
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
            <button
              onClick={() => { setMobileOpen(false); onNavigate(Page.QUOTE); }}
              className="block w-full text-center px-4 py-3 rounded-xl font-bold bg-[rgb(61,141,122)] text-white mt-2"
            >
              Check Availability
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

