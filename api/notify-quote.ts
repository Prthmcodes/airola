// New-quote alert for the team: one email (Resend) and, optionally, one phone push (ntfy).
// Called fire-and-forget by pages/QuoteReview.tsx after a quote is saved; a failure here never affects the customer.
//
// POST /api/notify-quote  { name, email, phone, propertyName, address, beds, baths, cleaningType,
//                           frequency, addOns, price, notes, ref? }
// The caller cannot choose recipients, subject or template: recipients come only from NOTIFY_EMAILS,
// so this cannot be used as an email relay. All env vars are server-only (never VITE_-prefixed).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAILS = (process.env.NOTIFY_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
const NOTIFY_FROM = process.env.NOTIFY_FROM;
const NTFY_TOPIC = process.env.NTFY_TOPIC;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const ADMIN_URL = 'https://airola.co.uk/admin';
const MAX_BODY_BYTES = 8 * 1024;
const UPSTREAM_TIMEOUT_MS = 8000;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

const ADD_ON_NAMES: Record<string, string> = {
  essentials: 'Essentials Restocking',
  linen: 'Linen Change',
  dishwashing: 'Dishwashing',
  appliance: 'Fridge & Microwave',
};

// field -> [required, max length]. Every other field is rejected.
const STRING_FIELDS: Record<string, [boolean, number]> = {
  name: [true, 100],
  email: [false, 254],
  phone: [false, 40],
  propertyName: [false, 120],
  address: [false, 300],
  notes: [false, 2000],
  ref: [false, 40],
};
const ALLOWED_FIELDS = [...Object.keys(STRING_FIELDS), 'beds', 'baths', 'cleaningType', 'frequency', 'addOns', 'price'];
const CLEANING_TYPES = ['starter', 'standard', 'premium'];
const FREQUENCIES = ['one-time', 'recurring'];

type Quote = {
  name: string; email: string; phone: string; propertyName: string; address: string; notes: string; ref: string;
  beds: number; baths: number; cleaningType: string; frequency: string; addOns: string[]; price: number | null;
};

const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };

const error = (status: number, message: string, headers?: Record<string, string>) =>
  Response.json({ ok: false, error: message }, { status, headers: { ...NO_STORE, ...headers } });

// ---------- Rate limit (best effort: per instance, in memory) ----------

const hits = new Map<string, number[]>();

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  if (hits.size > 5000) hits.clear(); // never grow without bound
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT.max;
};

const clientIp = (request: Request) =>
  (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';

// ---------- Validation ----------

const parseBody = (raw: string): Quote | string => {
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return 'Body must be valid JSON.';
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Body must be a JSON object.';
  const b = body as Record<string, unknown>;
  const extra = Object.keys(b).filter(k => !ALLOWED_FIELDS.includes(k));
  if (extra.length) return `Unexpected field(s): ${extra.join(', ')}.`;

  const out: Record<string, unknown> = {};
  for (const [key, [required, max]] of Object.entries(STRING_FIELDS)) {
    const v = b[key] ?? '';
    if (typeof v !== 'string') return `${key} must be a string.`;
    if (required && !v.trim()) return `${key} is required.`;
    if (v.length > max) return `${key} is longer than ${max} characters.`;
    out[key] = v.trim();
  }
  for (const key of ['beds', 'baths']) {
    const v = b[key];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 50) return `${key} must be a whole number from 0 to 50.`;
    out[key] = v;
  }
  if (typeof b.cleaningType !== 'string' || !CLEANING_TYPES.includes(b.cleaningType)) {
    return `cleaningType must be one of: ${CLEANING_TYPES.join(', ')}.`;
  }
  if (typeof b.frequency !== 'string' || !FREQUENCIES.includes(b.frequency)) {
    return `frequency must be one of: ${FREQUENCIES.join(', ')}.`;
  }
  const addOns = b.addOns ?? [];
  if (!Array.isArray(addOns) || addOns.length > 10 || !addOns.every(a => typeof a === 'string' && /^[a-z0-9-]{1,32}$/.test(a))) {
    return 'addOns must be an array of up to 10 add-on ids.';
  }
  const price = b.price ?? null;
  if (price !== null && (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 100000)) {
    return 'price must be a number from 0 to 100000, or null.';
  }
  return { ...out, cleaningType: b.cleaningType, frequency: b.frequency, addOns, price } as Quote;
};

// ---------- Message building ----------

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// No CR/LF (header injection) or other control characters in a single-line value.
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();

const priceText = (p: number | null) => (p === null ? 'TBC' : `£${p}`);

const londonTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'short' }).format(new Date());

const buildEmail = (q: Quote) => {
  const subject = oneLine(`New quote: ${q.name}, ${q.beds}-bed, ${priceText(q.price)}`).slice(0, 200);
  const addOns = q.addOns.map(id => ADD_ON_NAMES[id] || id).join(', ') || 'None';
  const telDigits = q.phone.replace(/[^\d+]/g, '');
  const emailOk = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(q.email);
  const property = [q.propertyName, q.address].filter(Boolean).join(', ') || 'Not given';
  const time = londonTime();

  const rows: [string, string, string][] = [
    // [label, html value, text value]
    ['Name', escapeHtml(q.name), q.name],
    ['Phone', telDigits ? `<a href="tel:${escapeHtml(telDigits)}">${escapeHtml(q.phone)}</a>` : 'Not given', q.phone || 'Not given'],
    ['Email', emailOk ? `<a href="mailto:${q.email}">${escapeHtml(q.email)}</a>` : escapeHtml(q.email || 'Not given'), q.email || 'Not given'],
    ['Property / area', escapeHtml(property), property],
    ['Size', `${q.beds} bed, ${q.baths} bath`, `${q.beds} bed, ${q.baths} bath`],
    ['Package', escapeHtml(q.cleaningType), q.cleaningType],
    ['Frequency', escapeHtml(q.frequency), q.frequency],
    ['Add-ons', escapeHtml(addOns), addOns],
    ['Price (as submitted)', escapeHtml(priceText(q.price)), priceText(q.price)],
    ['Notes', escapeHtml(q.notes || 'None').replace(/\r?\n/g, '<br>'), q.notes || 'None'],
    ['Reference', escapeHtml(q.ref || 'N/A'), q.ref || 'N/A'],
    ['Time (London)', escapeHtml(time), time],
  ];

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a">
<h2 style="color:#2D6E5F;margin:0 0 12px">New quote request</h2>
<table cellpadding="6" style="border-collapse:collapse">
${rows.map(([label, value]) => `<tr><td style="color:#64748b;vertical-align:top;white-space:nowrap">${label}</td><td>${value}</td></tr>`).join('\n')}
</table>
<p style="margin-top:16px"><a href="${ADMIN_URL}" style="color:#2D6E5F;font-weight:bold">Open the admin Command Center</a></p>
</div>`;
  const text = `New quote request\n\n${rows.map(([label, , value]) => `${label}: ${value}`).join('\n')}\n\nAdmin: ${ADMIN_URL}\n`;
  return { subject, html, text };
};

// Public server: no phone, email or address in the push.
const buildPush = (q: Quote) => oneLine(`New quote: ${q.name.split(/\s+/)[0]}, ${q.beds}-bed, ${priceText(q.price)}`).slice(0, 120);

// ---------- Channels ----------

const sendEmail = async (email: ReturnType<typeof buildEmail>) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: NOTIFY_FROM, to: NOTIFY_EMAILS, subject: email.subject, html: email.html, text: email.text }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) {
    // Log only the status and Resend's own error name; never the key or the payload.
    const body = await res.json().catch(() => null);
    throw new Error(`Resend HTTP ${res.status}${body?.name ? ` (${body.name})` : ''}`);
  }
};

const sendPush = async (message: string) => {
  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC!)}`, {
    method: 'POST',
    headers: { Title: 'Airola quote', Priority: 'high', Click: ADMIN_URL, Tags: 'broom', 'Content-Type': 'text/plain; charset=utf-8' },
    body: message,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`ntfy HTTP ${res.status}`);
};

const reason = (r: PromiseSettledResult<unknown>) =>
  r.status === 'rejected' ? ((r.reason as Error)?.name === 'TimeoutError' ? 'timeout' : (r.reason as Error)?.message) : '';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return error(405, 'Method not allowed. Use POST.', { Allow: 'POST' });

    if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
      return error(415, 'Content-Type must be application/json.');
    }
    const declared = Number(request.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) return error(413, `Body must be at most ${MAX_BODY_BYTES} bytes.`);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return error(413, `Body must be at most ${MAX_BODY_BYTES} bytes.`);

    if (rateLimited(clientIp(request))) return error(429, 'Too many requests. Try again later.', { 'Retry-After': '600' });

    const parsed = parseBody(raw);
    if (typeof parsed === 'string') return error(400, parsed);

    const emailReady = Boolean(RESEND_API_KEY && NOTIFY_EMAILS.length && NOTIFY_FROM);
    const pushReady = Boolean(NTFY_TOPIC);
    const email = buildEmail(parsed);
    const push = buildPush(parsed);

    // Local testing only: show what would be sent, call nothing. Recipients/topic are summarised, not printed.
    if (!IS_PRODUCTION && request.headers.get('x-dry-run') === '1') {
      return Response.json(
        {
          ok: true,
          dryRun: true,
          email: { configured: emailReady, recipients: NOTIFY_EMAILS.length, subject: email.subject, html: email.html, text: email.text },
          push: { configured: pushReady, title: 'Airola quote', priority: 'high', click: ADMIN_URL, message: push },
        },
        { headers: NO_STORE },
      );
    }

    if (!emailReady && !pushReady) {
      console.warn('[api/notify-quote] not configured: set RESEND_API_KEY, NOTIFY_EMAILS and NOTIFY_FROM (and optionally NTFY_TOPIC)');
      return error(503, 'Quote alerts are not configured.');
    }
    if (!emailReady) console.warn('[api/notify-quote] email skipped: RESEND_API_KEY, NOTIFY_EMAILS or NOTIFY_FROM is not set');

    // Each channel is independent: one failing never stops the other.
    const [emailResult, pushResult] = await Promise.allSettled([
      emailReady ? sendEmail(email) : Promise.reject(new Error('not configured')),
      pushReady ? sendPush(push) : Promise.reject(new Error('not configured')),
    ]);
    if (emailReady && emailResult.status === 'rejected') console.error(`[api/notify-quote] email failed: ${reason(emailResult)}`);
    if (pushReady && pushResult.status === 'rejected') console.error(`[api/notify-quote] push failed: ${reason(pushResult)}`);

    if (emailResult.status === 'fulfilled' || pushResult.status === 'fulfilled') {
      return Response.json({ ok: true }, { headers: NO_STORE });
    }
    return error(502, 'No alert channel succeeded.');
  },
};
