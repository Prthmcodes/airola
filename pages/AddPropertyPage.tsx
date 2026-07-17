
import React, { useState } from 'react';
import { Page, Property, User as UserType } from '../types';
import { db } from '../db';
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  ClipboardList, 
  User, 
  Phone, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Link as LinkIcon,
  ShieldCheck
} from 'lucide-react';

interface AddPropertyPageProps {
  onNavigate: (page: Page) => void;
  user: UserType;
}

const AddPropertyPage: React.FC<AddPropertyPageProps> = ({ onNavigate, user }) => {
  const [formData, setFormData] = useState({
    ownerName: user.name || '',
    ownerPhone: '',
    propertyName: '',
    address: '',
    beds: 1,
    baths: 1,
    notes: '',
    listingDocUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Ownership is attached server-side to the logged-in account
    const newProperty: Property = {
      id: '',
      name: formData.propertyName,
      address: formData.address,
      beds: formData.beds,
      baths: formData.baths,
      notes: formData.notes,
      listingDocUrl: formData.listingDocUrl,
      verificationStatus: 'unverified'
    };

    await db.saveProperty(newProperty);
    
    // Simulate API call delay for UX
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => onNavigate(Page.DASHBOARD), 2000);
    }, 800);
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-32 text-center">
        <div className="w-24 h-24 bg-[rgb(204,236,229)] text-[rgb(61,141,122)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Property Registered!</h1>
        <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">Your listing has been added to the Airola network. Vetting will take up to 2 hours.</p>
        <div className="p-4 bg-[rgb(235,247,244)] rounded-2xl border border-[rgb(204,236,229)] text-sm text-[rgb(45,110,95)] flex items-center justify-center font-bold">
           <Sparkles className="w-5 h-5 mr-2" /> Syncing with operations center...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <button 
            onClick={() => onNavigate(Page.DASHBOARD)}
            className="group flex items-center text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 hover:text-slate-900 transition-colors hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.1)]"
          >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform" /> Back to Dashboard
          </button>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Register Property</h1>
          <p className="text-slate-500 font-medium mt-2">Add a new listing to your secure Airola portfolio.</p>
        </div>
        <div className="hidden md:block">
           <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 bg-[rgb(235,247,244)] text-[rgb(61,141,122)] rounded-2xl flex items-center justify-center">
                 <Home className="w-6 h-6" />
              </div>
              <div className="pr-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Step</p>
                 <p className="font-bold text-slate-900">Portfolio Growth</p>
              </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Host Identity Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-[4rem] -z-0"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
              <User className="w-6 h-6 mr-3 text-[rgb(61,141,122)]" /> Host Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    placeholder="e.g. Johnathan Smith"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="tel" 
                    required
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                    placeholder="+44 7700 900000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Details Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
            <Home className="w-6 h-6 mr-3 text-[rgb(61,141,122)]" /> Property Details
          </h3>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Property Nickname</label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    value={formData.propertyName}
                    onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                    placeholder="e.g. Skyline Studio"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Postal Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Street, Postcode, District"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bedrooms</label>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button 
                      key={n}
                      type="button"
                      onClick={() => setFormData({...formData, beds: n})}
                      className={`w-14 h-14 rounded-2xl font-black text-lg transition-all border-2 ${
                        formData.beds === n 
                          ? 'bg-[rgb(61,141,122)] text-white border-[rgb(61,141,122)] shadow-lg' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[rgb(172,216,206)] hover:text-[rgb(61,141,122)]'
                      } hover:shadow-[0_0_10px_rgba(172,216,206,0.7)]`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bathrooms</label>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      type="button"
                      onClick={() => setFormData({...formData, baths: n})}
                      className={`w-14 h-14 rounded-2xl font-black text-lg transition-all border-2 ${
                        formData.baths === n 
                          ? 'bg-[rgb(61,141,122)] text-white border-[rgb(61,141,122)] shadow-lg' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[rgb(172,216,206)] hover:text-[rgb(61,141,122)]'
                      } hover:shadow-[0_0_10px_rgba(172,216,206,0.7)]`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Listing URL / Doc</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="url" 
                  value={formData.listingDocUrl}
                  onChange={(e) => setFormData({...formData, listingDocUrl: e.target.value})}
                  placeholder="Airbnb listing URL (Required for vetting)"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Access & Special Notes</label>
              <div className="relative">
                <ClipboardList className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Lockbox codes, parking details, or specific room instructions..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(106,176,160)]/10 focus:border-[rgb(106,176,160)] transition-all font-medium text-slate-900 min-h-[120px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center space-x-3 text-slate-400 font-medium text-sm">
             <ShieldCheck className="w-5 h-5 text-[rgb(106,176,160)]" />
             <span>Secured turnover data protocol active</span>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center min-w-[240px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''} hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]`}
          >
            {isSubmitting ? 'Registering...' : 'Register Listing'} 
            {!isSubmitting && <ArrowRight className="ml-3 w-6 h-6 text-[rgb(106,176,160)]" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyPage;
