import React, { useState } from 'react';
import { Page, QuoteData, CleaningTask, User } from '../types';
import { db } from '../db';
import { appendToSheet } from '../sheets';
import { CheckCircle2, Send, MessageSquare, ShieldCheck, User as UserIcon, Phone } from 'lucide-react';

interface QuoteReviewProps {
  quote: QuoteData;
  setQuote: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNavigate: (page: Page) => void;
  user: User;
}

const QuoteReview: React.FC<QuoteReviewProps> = ({ quote, setQuote, onNavigate, user }) => {
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addOns = [
    { id: 'essentials', name: 'Essentials Restocking' },
    { id: 'linen', name: 'Linen Change' },
    { id: 'dishwashing', name: 'Dishwashing' },
    { id: 'appliance', name: 'Fridge & Microwave' }
  ];

  const getAddonName = (id: string) => addOns.find(a => a.id === id)?.name || id;

  const handleSend = async () => {
    setIsSubmitting(true);
    setError('');
    const effectiveEmail = user.isLoggedIn ? user.email : quote.ownerEmail || '';
    const effectiveName = user.isLoggedIn ? user.name : quote.ownerName || 'Guest';
    const effectivePhone = user.isLoggedIn ? (user.phone || quote.ownerPhone) : quote.ownerPhone;
    const finalPrice = quote.totalPrice || quote.basePrice;

    try {
      if (user.isLoggedIn) {
        // Find or create the property for this host
        const properties = await db.getProperties();
        let currentProp = properties.find(p => p.id === quote.propertyId || (p.name === quote.propertyName && p.address === quote.address));

        if (!currentProp) {
          const saved = await db.saveProperty({
            id: '',
            name: quote.propertyName || 'New Listing',
            address: quote.address || '',
            beds: quote.beds,
            baths: quote.baths,
            listingDocUrl: quote.listingDocUrl,
            verificationStatus: 'unverified'
          });
          if (saved) currentProp = saved;
        }

        const newTask: CleaningTask = {
          id: '',
          propertyId: currentProp?.id,
          propertyName: currentProp?.name || quote.propertyName || 'New Listing',
          propertyAddress: currentProp?.address || quote.address || '',
          beds: quote.beds,
          baths: quote.baths,
          type: quote.cleaningType,
          status: 'pending',
          isPriorityHost: quote.isPriorityHost,
          frequency: quote.frequency,
          addOns: quote.toiletries,
          scheduledAt: 'ASAP / Quote Requested',
          price: finalPrice,
          notes: quote.notes,
        };
        const savedTask = await db.saveTask(newTask);

        // Notify the admin team
        await db.addNotification({
          type: 'quote_request',
          title: 'Action Required: New Booking Request',
          subject: `New booking request: ${quote.propertyName || quote.address}`,
          body: `A new booking request has been received.\n\nHost: ${effectiveName} (${effectiveEmail})\nPhone: ${effectivePhone || 'Not provided'}\nProperty: ${quote.propertyName}\nAddress: ${quote.address}\nTotal price: £${finalPrice}\n\nReference: ${savedTask?.ref || 'N/A'}`,
          recipientRole: 'admin',
          read: false,
        });
      } else {
        // Guest request — stored securely, visible only to the admin team
        const ok = await db.submitQuoteRequest(quote);
        if (!ok) {
          setError('Something went wrong sending your request. Please try again or contact us on WhatsApp.');
          return;
        }
      }

      // Backup log to Google Sheets (write-only)
      await appendToSheet('Sheet1', [
        new Date().toISOString(),
        effectiveName,
        effectiveEmail,
        effectivePhone || 'Not specified',
        quote.propertyName,
        quote.address,
        quote.beds,
        quote.baths,
        quote.cleaningType,
        quote.isPriorityHost ? 'Yes' : 'No',
        quote.frequency,
        finalPrice,
        quote.notes,
      ]);

      setIsSent(true);
      if (user.isLoggedIn) {
        setTimeout(() => onNavigate(Page.DASHBOARD), 3000);
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong sending your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="max-w-md mx-auto py-32 text-center">
        <div className="w-24 h-24 bg-[rgb(204,236,229)] text-[rgb(61,141,122)] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{user.isLoggedIn ? 'Booking Requested!' : 'Quote Sent!'}</h1>
        <p className="text-xl text-slate-500 mb-8">
          {user.isLoggedIn
            ? 'Your property has been registered and your first clean is being scheduled.'
            : "Your quote has been sent to our team. We'll be in touch with you shortly."}
        </p>

        {user.isLoggedIn ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
            Secured for Host: {user.name}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => onNavigate(Page.LANDING)}
              className="w-full py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-bold hover:bg-[rgb(45,110,95)] transition-all shadow-lg"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    );
  }

  const effectiveEmail = user.isLoggedIn ? user.email : quote.ownerEmail || 'Not specified';
  const effectiveName = user.isLoggedIn ? user.name : quote.ownerName || 'Guest';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Final Confirmation</h1>
        <p className="text-slate-500">Review your details before sending your {user.isLoggedIn ? 'booking request' : 'quote'}.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl">
        <div className="bg-[rgb(61,141,122)] p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[rgb(204,236,229)] text-sm font-bold uppercase tracking-widest mb-1">Quote Total</p>
              <h2 className="text-5xl font-black">£{quote.totalPrice || quote.basePrice}<span className="text-xl text-[rgb(172,216,206)] font-medium ml-1">/ clean</span></h2>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-2xl">
              <span className="font-bold">{quote.frequency === 'one-time' ? 'One-time' : 'Recurring Service'}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-12">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-[rgb(235,247,244)]/50 rounded-2xl border border-[rgb(204,236,229)]">
                <UserIcon className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{user.isLoggedIn ? 'Authenticated Host' : 'Full Name'}</p>
                  <p className="font-bold text-slate-900 truncate max-w-[120px]">{effectiveName}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <MessageSquare className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="font-bold text-slate-900 truncate max-w-[120px]">{effectiveEmail}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Phone className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Number</p>
                  <p className="font-bold text-slate-900">{quote.ownerPhone || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Service Details</h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">Property Nickname</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{quote.propertyName || '—'}</span>
                </li>
                <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">Property Size</span>
                  <span className="font-bold text-slate-900">{quote.beds} Bed, {quote.baths} Bath</span>
                </li>
                {quote.frequency === 'recurring' && (
                  <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600">Service Plan</span>
                    <span className="font-bold text-slate-900">Every turnover (£10 off applied)</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Selected Add-Ons</h3>
              <div className="flex flex-wrap gap-2">
                {quote.toiletries.length > 0 ? quote.toiletries.map(item => (
                  <span key={item} className="px-4 py-2 bg-[rgb(235,247,244)] text-[rgb(45,110,95)] rounded-full text-sm font-bold border border-[rgb(204,236,229)]">
                    {getAddonName(item)}
                  </span>
                )) : <p className="text-slate-400 italic">No extras selected.</p>}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
            <button onClick={() => onNavigate(Page.QUOTE)} className="w-full sm:w-auto px-8 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors">
              Edit Details
            </button>
            <button
              onClick={handleSend}
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-12 py-5 bg-[rgb(61,141,122)] text-white rounded-2xl font-extrabold text-xl hover:bg-[rgb(45,110,95)] transition-all shadow-xl flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Sending…' : user.isLoggedIn ? 'Confirm Booking Request' : 'Send Quote'} <Send className="ml-3 w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteReview;
