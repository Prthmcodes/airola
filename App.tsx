import React, { useState, useEffect } from 'react';
import { Page, User, QuoteData, UserRole, AirolaNotification } from './types';
import { db } from './db';
import LandingPage from './pages/LandingPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffManagementPage from './pages/StaffManagementPage';
import QuotePage from './pages/QuotePage';
import AddPropertyPage from './pages/AddPropertyPage';
import PricingPage from './pages/PricingPage';
import QuoteReview from './pages/QuoteReview';
import LoginPage from './pages/LoginPage';
import { GiveawayPage } from './pages/GiveawayPage';
import { ThanksPage } from './pages/ThanksPage';
import { BonusPage } from './pages/BonusPage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFAB from './components/WhatsAppFAB';
import NotificationCenter from './components/NotificationCenter';
import ChatBot from './components/ChatBot';

const GUEST_USER: User = { name: '', email: '', isLoggedIn: false, role: 'owner' };

// SEO: every page gets a real URL, title and description
const PAGE_META: Record<Page, { path: string; title: string; description: string }> = {
  [Page.LANDING]: { path: '/', title: 'Airola | Airbnb Turnover Cleaning in East London', description: 'Turnover cleaning for Airbnb and short-let hosts in East London. Guest-ready resets with photo proof after every clean.' },
  [Page.PRICING]: { path: '/pricing', title: 'Pricing & Packages | Airola Airbnb Cleaning East London', description: 'Simple pricing for Airbnb turnover cleaning. Standard Turnover from £45, Guest-Ready Plus from £79. £20 per extra bedroom. £10 off recurring cleans.' },
  [Page.QUOTE]: { path: '/quote', title: 'Get Your Price in 60 Seconds | Airola', description: 'Instant quote for your Airbnb turnover clean in East London. Live pricing by bedrooms, package and add-ons.' },
  [Page.REVIEW]: { path: '/quote/review', title: 'Review Your Quote | Airola', description: 'Confirm your Airbnb turnover cleaning quote.' },
  [Page.GIVEAWAY]: { path: '/giveaway', title: 'Win a £1 Turnover Clean | Airola Giveaway', description: 'East London Airbnb hosts: enter to win a full guest-ready turnover clean for £1.' },
  [Page.ABOUT_US]: { path: '/about-us', title: 'About Airola | East London Airbnb Cleaning Team', description: 'Airola removes the stress from short-let turnovers in East London with reliable cleaning and photo proof after every clean.' },
  [Page.CONTACT]: { path: '/contact', title: 'Contact Airola | Airbnb Cleaning East London', description: 'Get in touch: WhatsApp, phone or email. Serving Stratford, Royal Wharf, Canary Wharf and nearby.' },
  [Page.LEGAL]: { path: '/legal', title: 'Privacy, Terms & Cookies | Airola', description: 'Airola privacy policy, terms and conditions, and cookie policy.' },
  [Page.LOGIN]: { path: '/login', title: 'Host Login | Airola', description: 'Log in to manage your Airbnb turnover cleans.' },
  [Page.DASHBOARD]: { path: '/dashboard', title: 'Host Hub | Airola', description: 'Manage your properties and turnover cleans.' },
  [Page.ADMIN_DASHBOARD]: { path: '/admin', title: 'Command Center | Airola', description: 'Airola operations dashboard.' },
  [Page.STAFF_MANAGEMENT]: { path: '/admin/team', title: 'Team | Airola', description: 'Airola team management.' },
  [Page.ADD_PROPERTY]: { path: '/add-property', title: 'Register a Property | Airola', description: 'Add a listing to your Airola portfolio.' },
  [Page.BONUS]: { path: '/giveaway/entered', title: "You're In | Airola Giveaway", description: 'Giveaway entry confirmed.' },
  [Page.THANKS]: { path: '/thanks', title: 'Thank You | Airola', description: 'Thanks from Airola.' },
};

const pageFromPath = (pathname: string): Page => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const entry = (Object.entries(PAGE_META) as [Page, { path: string }][]).find(([, m]) => m.path === clean);
  return entry ? entry[0] : Page.LANDING;
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
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(initialQuote);

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
    window.history.replaceState({ page: currentPage }, '', PAGE_META[currentPage].path);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO: keep title and meta description in sync with the page
  useEffect(() => {
    const meta = PAGE_META[currentPage];
    document.title = meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `https://airola.co.uk${meta.path === '/' ? '' : meta.path}`);
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
      default: return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        currentPage={currentPage}
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
        onGoBack={goBack}
        notifications={notifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />
      <main className="flex-grow pt-[90px]">
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole={user.role}
        user={user}
        onMarkRead={markNotificationRead}
        onDelete={deleteNotification}
      />
      <WhatsAppFAB />
      <ChatBot onNavigate={navigate} />
    </div>
  );
};

export default App;
