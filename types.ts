export enum Page {
  LANDING = 'landing',
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  ADMIN_DASHBOARD = 'admin_dashboard',
  STAFF_MANAGEMENT = 'staff_management',
  QUOTE = 'quote',
  ADD_PROPERTY = 'add_property',
  PRICING = 'pricing',
  REVIEW = 'review',
  GIVEAWAY = 'giveaway',
  THANKS = 'thanks',
  BONUS = 'bonus',
  ABOUT_US = 'about_us',
  CONTACT = 'contact',
  LEGAL = 'legal'
}

export type UserRole = 'owner' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  isLoggedIn: boolean;
  role: UserRole;
}

export interface Property {
  id: string;
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  name: string;
  address: string;
  beds: number;
  baths: number;
  lastCleanReport?: string;
  calendarSynced?: boolean;
  listingDocUrl?: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  notes?: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface CleaningTask {
  id: string;
  ref?: string;
  propertyId?: string;
  ownerId?: string;
  propertyName: string;
  propertyAddress: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  beds: number;
  baths: number;
  type: 'starter' | 'standard' | 'premium';
  status: TaskStatus;
  isPriorityHost?: boolean;
  frequency?: 'one-time' | 'recurring';
  addOns?: string[];
  scheduledAt?: string;
  cleanerName?: string;
  cleanerPhone?: string;
  cleanerRole?: string;
  estimatedArrival?: string;
  price: number;
  notes?: string;
  listingDocUrl?: string;
  verificationStatus?: 'unverified' | 'verified' | 'rejected';
  isGuestRequest?: boolean;
  paymentStatus?: 'unpaid' | 'deposit_paid' | 'paid';
  completedAt?: string;
  confirmationSent?: boolean;
  reminderSent?: boolean;
  rebookOfferSent?: boolean;
  reviewRequestSent?: boolean;
  winbackSent?: boolean;
}

export interface Cleaner {
  id: string;
  name: string;
  role: 'lead' | 'junior' | 'team';
  phone: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export interface QuoteData {
  propertyId?: string;
  propertyName?: string;
  address?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  beds: number;
  baths: number;
  cleaningType: 'starter' | 'standard' | 'premium';
  isPriorityHost: boolean;
  laundry: boolean;
  toiletries: string[];
  frequency: 'one-time' | 'recurring';
  basePrice: number;
  totalPrice?: number;
  calendarUrl?: string;
  notes?: string;
  listingDocUrl?: string;
}

export interface Package {
  name: string;
  price: string;
  oldPrice?: string;
  period?: string;
  description?: string;
  features: string[];
  recommended?: boolean;
  buttonText?: string;
  smallText?: string;
  bonus?: string;
  badge?: string;
}

export interface AirolaNotification {
  id: string;
  type: 'quote_request' | 'booking_reminder' | 'cleaning_complete' | 'system' | 'dispatch';
  title: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  recipientRole: UserRole;
  recipientId?: string;
}
