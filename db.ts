import { createClient, Session } from '@supabase/supabase-js';
import { Property, CleaningTask, Cleaner, AirolaNotification, User, QuoteData } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------- Row mappers (snake_case DB <-> camelCase app) ----------

const mapProperty = (row: any): Property => ({
  id: row.id,
  ownerId: row.owner_id,
  ownerName: row.owner_name ?? undefined,
  ownerPhone: row.owner_phone ?? undefined,
  ownerEmail: row.owner_email ?? undefined,
  name: row.name,
  address: row.address,
  beds: row.beds,
  baths: row.baths,
  listingDocUrl: row.listing_doc_url ?? undefined,
  verificationStatus: row.verification_status,
  notes: row.notes ?? undefined,
});

const mapTask = (row: any): CleaningTask => ({
  id: row.id,
  ref: row.ref,
  propertyId: row.property_id ?? undefined,
  ownerId: row.owner_id,
  propertyName: row.property_name,
  propertyAddress: row.property_address,
  ownerName: row.owner_name ?? undefined,
  ownerPhone: row.owner_phone ?? undefined,
  ownerEmail: row.owner_email ?? undefined,
  beds: row.beds,
  baths: row.baths,
  type: row.type,
  status: row.status,
  isPriorityHost: row.is_priority_host,
  frequency: row.frequency,
  addOns: row.add_ons ?? [],
  scheduledAt: row.scheduled_at ?? undefined,
  cleanerName: row.cleaner_name ?? undefined,
  cleanerPhone: row.cleaner_phone ?? undefined,
  cleanerRole: row.cleaner_role ?? undefined,
  estimatedArrival: row.estimated_arrival ?? undefined,
  price: Number(row.price),
  notes: row.notes ?? undefined,
  verificationStatus: row.verification_status ?? undefined,
  paymentStatus: row.payment_status ?? 'unpaid',
  completedAt: row.completed_at ?? undefined,
  confirmationSent: row.confirmation_sent ?? false,
  reminderSent: row.reminder_sent ?? false,
  rebookOfferSent: row.rebook_offer_sent ?? false,
  reviewRequestSent: row.review_request_sent ?? false,
  winbackSent: row.winback_sent ?? false,
});

const mapStaff = (row: any): Cleaner => ({
  id: row.id,
  name: row.name,
  role: row.role,
  phone: row.phone,
  status: row.status,
  joinedAt: row.joined_at,
});

const mapNotification = (row: any): AirolaNotification => ({
  id: row.id,
  type: row.type,
  title: row.title,
  subject: row.subject,
  body: row.body,
  timestamp: row.created_at,
  read: row.read,
  recipientRole: row.recipient_role,
  recipientId: row.recipient_id ?? undefined,
});

class AirolaDatabase {
  private dispatchUpdate(source?: string) {
    window.dispatchEvent(new CustomEvent('storage_update', { detail: { source } }));
  }

  // ---------- Auth ----------

  private async profileToUser(session: Session | null): Promise<User | null> {
    if (!session?.user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? undefined,
      isLoggedIn: true,
      role: data.role,
    };
  }

  async getSession(): Promise<User | null> {
    const { data } = await supabase.auth.getSession();
    return this.profileToUser(data.session);
  }

  onAuthChange(callback: () => void): () => void {
    const { data } = supabase.auth.onAuthStateChange(() => callback());
    return () => data.subscription.unsubscribe();
  }

  async signUp(name: string, email: string, phone: string, password: string): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) throw error;
    this.dispatchUpdate('session');
    return { needsConfirmation: !data.session };
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = await this.profileToUser(data.session);
    if (!user) throw new Error('Could not load your profile. Please try again.');
    this.dispatchUpdate('session');
    return user;
  }

  async clearSession(): Promise<void> {
    await supabase.auth.signOut();
    this.dispatchUpdate('session');
  }

  // ---------- Properties ----------

  async getProperties(_ownerEmail?: string): Promise<Property[]> {
    // Row Level Security scopes results: owners see their own, admins see all.
    const { data, error } = await supabase
      .from('properties')
      .select('*, profiles(name, email, phone)')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return (data ?? []).map((row: any) => ({
      ...mapProperty(row),
      ownerName: row.profiles?.name,
      ownerEmail: row.profiles?.email,
      ownerPhone: row.profiles?.phone ?? undefined,
    }));
  }

  async saveProperty(property: Property, source?: string): Promise<Property | null> {
    const payload = {
      name: property.name,
      address: property.address,
      beds: property.beds,
      baths: property.baths,
      listing_doc_url: property.listingDocUrl || null,
      verification_status: property.verificationStatus,
      notes: property.notes || null,
    };
    let result;
    if (UUID_RE.test(property.id)) {
      result = await supabase.from('properties').update(payload).eq('id', property.id).select().maybeSingle();
    } else {
      const { data: auth } = await supabase.auth.getUser();
      result = await supabase
        .from('properties')
        .insert({ ...payload, owner_id: auth.user?.id })
        .select()
        .maybeSingle();
    }
    if (result.error) { console.error(result.error); return null; }
    this.dispatchUpdate(source || 'properties');
    return result.data ? mapProperty(result.data) : null;
  }

  // ---------- Cleaning tasks ----------

  async getTasks(_ownerEmail?: string): Promise<CleaningTask[]> {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .select('*, profiles(name, email, phone)')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return (data ?? []).map((row: any) => ({
      ...mapTask(row),
      ownerName: row.profiles?.name ?? row.owner_name,
      ownerEmail: row.profiles?.email,
      ownerPhone: row.profiles?.phone ?? undefined,
    }));
  }

  async saveTask(task: CleaningTask, source?: string): Promise<CleaningTask | null> {
    const payload = {
      property_id: task.propertyId && UUID_RE.test(task.propertyId) ? task.propertyId : null,
      property_name: task.propertyName,
      property_address: task.propertyAddress,
      beds: task.beds,
      baths: task.baths,
      type: task.type,
      status: task.status,
      is_priority_host: task.isPriorityHost ?? false,
      frequency: task.frequency ?? 'one-time',
      add_ons: task.addOns ?? [],
      scheduled_at: task.scheduledAt || null,
      cleaner_name: task.cleanerName || null,
      cleaner_phone: task.cleanerPhone || null,
      cleaner_role: task.cleanerRole || null,
      estimated_arrival: task.estimatedArrival || null,
      price: task.price,
      notes: task.notes || null,
      payment_status: task.paymentStatus ?? 'unpaid',
      completed_at: task.completedAt || null,
      confirmation_sent: task.confirmationSent ?? false,
      reminder_sent: task.reminderSent ?? false,
      rebook_offer_sent: task.rebookOfferSent ?? false,
      review_request_sent: task.reviewRequestSent ?? false,
      winback_sent: task.winbackSent ?? false,
    };
    let result;
    if (UUID_RE.test(task.id)) {
      result = await supabase.from('cleaning_tasks').update(payload).eq('id', task.id).select().maybeSingle();
    } else {
      const { data: auth } = await supabase.auth.getUser();
      result = await supabase
        .from('cleaning_tasks')
        .insert({ ...payload, owner_id: task.ownerId || auth.user?.id })
        .select()
        .maybeSingle();
    }
    if (result.error) { console.error(result.error); return null; }
    this.dispatchUpdate(source || 'tasks');
    return result.data ? mapTask(result.data) : null;
  }

  async deleteTask(taskId: string, source?: string): Promise<void> {
    const { error } = await supabase.from('cleaning_tasks').delete().eq('id', taskId);
    if (error) console.error(error);
    this.dispatchUpdate(source || 'tasks');
  }

  // ---------- Guest quote requests ----------

  async submitQuoteRequest(quote: QuoteData): Promise<boolean> {
    const { error } = await supabase.from('quote_requests').insert({
      name: quote.ownerName || 'Guest',
      email: quote.ownerEmail || '',
      phone: quote.ownerPhone || null,
      property_name: quote.propertyName || null,
      address: quote.address || '',
      beds: quote.beds,
      baths: quote.baths,
      type: quote.cleaningType,
      is_priority_host: quote.isPriorityHost,
      frequency: quote.frequency,
      add_ons: quote.toiletries,
      price: quote.totalPrice ?? quote.basePrice,
      notes: quote.notes || null,
    });
    if (error) { console.error(error); return false; }
    return true;
  }

  async getQuoteRequests(): Promise<CleaningTask[]> {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return (data ?? []).map((row: any) => ({
      id: row.id,
      ref: `GUEST-${row.id.slice(0, 6).toUpperCase()}`,
      propertyName: row.property_name || 'Guest enquiry',
      propertyAddress: row.address,
      ownerName: row.name,
      ownerPhone: row.phone ?? undefined,
      ownerEmail: row.email,
      beds: row.beds,
      baths: row.baths,
      type: row.type,
      status: 'pending' as const,
      isPriorityHost: row.is_priority_host,
      frequency: row.frequency,
      addOns: row.add_ons ?? [],
      scheduledAt: new Date(row.created_at).toLocaleString(),
      price: Number(row.price),
      notes: row.notes ?? undefined,
      verificationStatus: 'unverified' as const,
      isGuestRequest: true,
    }));
  }

  async deleteQuoteRequest(id: string): Promise<void> {
    const { error } = await supabase.from('quote_requests').delete().eq('id', id);
    if (error) console.error(error);
    this.dispatchUpdate('tasks');
  }

  // ---------- Staff ----------

  async getStaff(): Promise<Cleaner[]> {
    const { data, error } = await supabase.from('staff').select('*').order('joined_at');
    if (error) { console.error(error); return []; }
    return (data ?? []).map(mapStaff);
  }

  async saveStaff(cleaner: Cleaner): Promise<void> {
    const payload = {
      name: cleaner.name,
      role: cleaner.role,
      phone: cleaner.phone,
      status: cleaner.status,
    };
    const { error } = UUID_RE.test(cleaner.id)
      ? await supabase.from('staff').update(payload).eq('id', cleaner.id)
      : await supabase.from('staff').insert(payload);
    if (error) console.error(error);
    this.dispatchUpdate('staff');
  }

  async deleteStaff(id: string): Promise<void> {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) console.error(error);
    this.dispatchUpdate('staff');
  }

  // ---------- Notifications ----------

  async getNotifications(_role?: string): Promise<AirolaNotification[]> {
    // RLS returns only the notifications this user may see.
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return (data ?? []).map(mapNotification);
  }

  async addNotification(note: Omit<AirolaNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      type: note.type,
      title: note.title,
      subject: note.subject,
      body: note.body,
      recipient_role: note.recipientRole,
      recipient_id: note.recipientId || null,
      read: false,
    });
    if (error) console.error(error);
    this.dispatchUpdate('notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) console.error(error);
    this.dispatchUpdate('notifications');
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) console.error(error);
    this.dispatchUpdate('notifications');
  }

  // ---------- Giveaway ----------

  async submitGiveaway(data: { name: string; mobile: string; email: string; experience: string; wantsOffers?: boolean }): Promise<{ success: boolean }> {
    const { error } = await supabase.from('giveaway_entries').insert({
      name: data.name,
      phone: data.mobile || null,
      email: data.email || null,
      experience: data.experience || null,
      wants_offers: data.wantsOffers ?? false,
    });
    if (error) { console.error(error); return { success: false }; }
    return { success: true };
  }
}

export const db = new AirolaDatabase();
