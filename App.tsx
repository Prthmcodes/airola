import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Page, User, QuoteData, UserRole, AirolaNotification } from './types';
import { db } from './db';
import LandingPage from './pages/LandingPage';
import QuotePage from './pages/QuotePage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import { GiveawayPage } from './pages/GiveawayPage';
import { ThanksPage } from './pages/ThanksPage';
import { BonusPage } from './pages/BonusPage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import OfferPage from './pages/OfferPage';
import Thanks10Page from './pages/Thanks10Page';
import NotFound from './pages/NotFound';
import AreaPage from './pages/AreaPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { PAGE_META, canonicalUrl, DEFAULT_OG_IMAGE } from './config/routes';
import { AREA_PAGES } from './config/areas';
import { loadQuoteDraft, saveQuoteDraft } from './utils/quoteSafety';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFAB from './components/WhatsAppFAB';
import NotificationCenter from './components/NotificationCenter';
import ChatBot from './components/ChatBot';
import MobileActionBar, { MOBILE_BAR_SPACER } from './components/MobileActionBar';

// Private and post-quote routes load on demand, keeping them out of the public pages' bundle.
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffManagementPage = lazy(() => import('./pages/StaffManagementPage'));
const AddPropertyPage = lazy(() => import('./pages/AddPropertyPage'));
const QuoteReview = lazy(() => import('./pages/QuoteReview'));

const PageLoading: React.FC = () => (
  <p role="status" className="max-w-xl mx-auto px-4 py-24 text-center text-slate-600">Loading…</p>
);

// Creates the <meta>/<link> tag if index.html doesn't already have it.
const upsertHeadTag = (selector: string, create: () => HTMLElement, attr: string, value: string) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};
const metaTag = (key: 'name' | 'property', name: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute(key, name);
  return el;
};

const GUEST_USER: User = { name: '', email: '', isLoggedIn: false, role: 'owner' };

const pageFromPath = (pathname: string): Page => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const entry = (Object.entries(PAGE_META) as [Page, { path: string }][]).find(([, m]) => m.path === clean);
  return entry ? entry[0] : Page.NOT_FOUND;
};

const initialQuote: QuoteData = {
  propertyName: '',
  address: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  beds: 1,
  baths: 1,
  cleaningType: 'standard',
  isPriorityHost: false,
  laundry: false,
  toiletries: [],
  frequency: 'one-time',
  basePrice: 45,
  totalPrice: 45,
  notes: ''
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => pageFromPath(window.location.pathname));
  const [history, setHistory] = useState<Page[]>([]);
  const [user, setUser] = useState<User>(GUEST_USER);
  const [notifications, setNotifications] = useState<AirolaNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Restore an in-progress quote after a reload so the visitor doesn't lose what they entered.
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(() => ({ ...initialQuote, ...loadQuoteDraft() }));

  useEffect(() => {
    saveQuoteDraft(currentQuote);
  }, [currentQuote]);

  const refreshData = async () => {
    const session = await db.getSession();
    if (session) {
      setUser(session);
      setNotifications(await db.getNotifications(session.role));
    } else {
      setUser(GUEST_USER);
      setNotifications([]);
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribeAuth = db.onAuthChange(refreshData);
    window.addEventListener('storage_update', refreshData);
    return () => {
      unsubscribeAuth();
      window.removeEventListener('storage_update', refreshData);
    };
  }, []);

  // Pre-fill quote contact details for logged-in hosts
  useEffect(() => {
    if (user.isLoggedIn) {
      setCurrentQuote(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.name,
        ownerEmail: prev.ownerEmail || user.email,
        ownerPhone: prev.ownerPhone || user.phone || ''
      }));
    }
  }, [user]);

  // Handle browser back button + real URLs
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setCurrentPage(event.state?.page || pageFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    // Unknown URLs keep their address so the visitor can see what they typed.
    window.history.replaceState({ page: currentPage }, '', currentPage === Page.NOT_FOUND ? window.location.pathname : PAGE_META[currentPage].path);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO: keep title and meta description in sync with the page
  useEffect(() => {
    const meta = PAGE_META[currentPage];
    document.title = meta.title;
    const url = canonicalUrl(currentPage === Page.NOT_FOUND ? window.location.pathname : meta.path);
    upsertHeadTag('meta[name="description"]', metaTag('name', 'description'), 'content', meta.description);
    upsertHeadTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url);
    upsertHeadTag('meta[property="og:title"]', metaTag('property', 'og:title'), 'content', meta.title);
    upsertHeadTag('meta[property="og:description"]', metaTag('property', 'og:description'), 'content', meta.ogDescription ?? meta.description);
    upsertHeadTag('meta[property="og:url"]', metaTag('property', 'og:url'), 'content', url);
    upsertHeadTag('meta[property="og:image"]', metaTag('property', 'og:image'), 'content', DEFAULT_OG_IMAGE);
    let robots = document.querySelector('meta[name="robots"]');
    if (meta.noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex');
    } else {
      robots?.remove();
    }
  }, [currentPage]);

  const navigate = (page: Page) => {
    if (page !== currentPage) {
      setHistory(prev => [...prev, currentPage]);
      setCurrentPage(page);
      window.history.pushState({ page }, '', PAGE_META[page].path);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(prevPage);
      window.scrollTo(0, 0);
    } else {
      navigate(Page.LANDING);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigate(loggedInUser.role === 'admin' ? Page.ADMIN_DASHBOARD : Page.DASHBOARD);
  };

  const handleLogout = async () => {
    await db.clearSession();
    setUser(GUEST_USER);
    setNotifications([]);
    navigate(Page.LANDING);
  };

  const markNotificationRead = async (id: string) => {
    await db.markNotificationRead(id);
    setNotifications(await db.getNotifications(user.role));
  };

  const deleteNotification = async (id: string) => {
    await db.deleteNotification(id);
    setNotifications(await db.getNotifications(user.role));
  };

  const withAuth = (component: React.ReactNode, requiredRole?: UserRole) => {
    if (!user.isLoggedIn) {
      return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
    }
    if (requiredRole === 'admin' && user.role !== 'admin') {
      return <OwnerDashboard user={user} onNavigate={navigate} onSelectQuote={setCurrentQuote} />;
    }
    return component;
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <LandingPage onNavigate={navigate} />;
      case Page.LOGIN: return user.isLoggedIn
        ? (user.role === 'admin'
            ? <AdminDashboard onNavigate={navigate} />
            : <OwnerDashboard user={user} onNavigate={navigate} onSelectQuote={setCurrentQuote} />)
        : <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
      case Page.DASHBOARD: return withAuth(<OwnerDashboard user={user} onNavigate={navigate} onSelectQuote={setCurrentQuote} />, 'owner');
      case Page.ADMIN_DASHBOARD: return withAuth(<AdminDashboard onNavigate={navigate} />, 'admin');
      case Page.STAFF_MANAGEMENT: return withAuth(<StaffManagementPage onNavigate={navigate} />, 'admin');
      case Page.QUOTE: return <QuotePage quote={currentQuote} setQuote={setCurrentQuote} onNavigate={navigate} user={user} />;
      case Page.ADD_PROPERTY: return withAuth(<AddPropertyPage onNavigate={navigate} user={user} />, 'owner');
      case Page.PRICING: return <PricingPage onNavigate={navigate} />;
      case Page.REVIEW: return <QuoteReview quote={currentQuote} setQuote={setCurrentQuote} onNavigate={navigate} user={user} />;
      case Page.GIVEAWAY: return <GiveawayPage onNavigate={navigate} />;
      case Page.THANKS: return <ThanksPage onNavigate={navigate} />;
      case Page.BONUS: return <BonusPage onNavigate={navigate} />;
      case Page.ABOUT_US: return <AboutUs onNavigate={navigate} />;
      case Page.CONTACT: return <ContactPage />;
      case Page.LEGAL: return <LegalPage />;
      case Page.OFFER: return <OfferPage />;
      case Page.THANKS10: return <Thanks10Page />;
      case Page.NOT_FOUND: return <NotFound onNavigate={navigate} />;
      case Page.TESTIMONIALS: return <TestimonialsPage />;
      case Page.AREA_STRATFORD: return <AreaPage area={AREA_PAGES.stratford} onNavigate={navigate} />;
      case Page.AREA_CANARY_WHARF: return <AreaPage area={AREA_PAGES['canary-wharf']} onNavigate={navigate} />;
      case Page.AREA_ROYAL_WHARF: return <AreaPage area={AREA_PAGES['royal-wharf']} onNavigate={navigate} />;
      default: return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-svh">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById('main');
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-5 focus:py-3 focus:rounded-xl focus:bg-[#2D6E5F] focus:text-white focus:font-bold"
      >
        Skip to main content
      </a>
      <Navbar
        currentPage={currentPage}
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
        onGoBack={goBack}
        notifications={notifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />
      <main id="main" tabIndex={-1} className="flex-grow pt-[90px] focus:outline-none">
        <ErrorBoundary key={currentPage}>
          <Suspense fallback={<PageLoading />}>
            {renderPage()}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer onNavigate={navigate} />
      {/* Room for the mobile action bar so it never covers the end of the footer */}
      <div aria-hidden="true" className={MOBILE_BAR_SPACER} />
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole={user.role}
        user={user}
        onMarkRead={markNotificationRead}
        onDelete={deleteNotification}
      />
      <aside aria-label="Contact shortcuts">
        <WhatsAppFAB />
        <MobileActionBar currentPage={currentPage} onNavigate={navigate} />
        <ChatBot onNavigate={navigate} />
      </aside>
    </div>
  );
};

export default App;
