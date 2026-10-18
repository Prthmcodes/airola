// Server-side proxy for the Google Sheets backup log (see sheets.ts and docs/google-apps-script.gs).
// The Apps Script URL and its secret token live only in server env vars, never in the browser bundle.
//
// POST /api/sheets  { "sheetName": "Sheet1" | "Sheet2", "values": [...] }
// Write-only: appends one row. There is deliberately no way to read the sheet through here.

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const SHEETS_TOKEN = process.env.SHEETS_TOKEN;

// The only rows the site writes, with their exact column counts.
const SHEETS: Record<string, { columns: number }> = {
  Sheet1: { columns: 13 }, // quote request (pages/QuoteReview.tsx)
  Sheet2: { columns: 6 }, // giveaway entry (pages/GiveawayPage.tsx)
};

const MAX_BODY_BYTES = 32 * 1024;
const MAX_VALUE_CHARS = 5000;
const UPSTREAM_TIMEOUT_MS = 10000;

type Cell = string | number | boolean | null;

const error = (status: number, message: string, headers?: Record<string, string>) =>
  Response.json({ ok: false, error: message }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

// Prevent spreadsheet formula injection: a leading + = - @ would run as a formula in Sheets.
const sanitize = (v: Cell): Cell => {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  return !t.startsWith("'") && /^[+=\-@]/.test(t) ? `'${t}` : v;
};

const parseBody = (raw: string): { sheetName: string; values: Cell[] } | string => {
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return 'Body must be valid JSON.';
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Body must be a JSON object.';
  const { sheetName, values } = body as Record<string, unknown>;
  const extra = Object.keys(body).filter(k => k !== 'sheetName' && k !== 'values');
  if (extra.length) return `Unexpected field(s): ${extra.join(', ')}.`;
  if (typeof sheetName !== 'string' || !Object.hasOwn(SHEETS, sheetName)) {
    return `sheetName must be one of: ${Object.keys(SHEETS).join(', ')}.`;
  }
  if (!Array.isArray(values)) return 'values must be an array.';
  const { columns } = SHEETS[sheetName];
  if (values.length !== columns) return `${sheetName} expects ${columns} values, got ${values.length}.`;
  for (const [i, v] of values.entries()) {
    const okType = v === null || ['string', 'number', 'boolean'].includes(typeof v);
    if (!okType) return `values[${i}] must be a string, number, boolean or null.`;
    if (typeof v === 'number' && !Number.isFinite(v)) return `values[${i}] must be a finite number.`;
    if (typeof v === 'string' && v.length > MAX_VALUE_CHARS) return `values[${i}] is longer than ${MAX_VALUE_CHARS} characters.`;
  }
  return { sheetName, values: values as Cell[] };
};

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

    const parsed = parseBody(raw);
    if (typeof parsed === 'string') return error(400, parsed);

    if (!APPS_SCRIPT_URL || !SHEETS_TOKEN) {
      console.error('[api/sheets] APPS_SCRIPT_URL or SHEETS_TOKEN is not set');
      return error(503, 'Sheets backup is not configured.');
    }

    try {
      // Apps Script answers a POST with a redirect to the result; fetch follows it.
      const upstream = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token: SHEETS_TOKEN, sheetName: parsed.sheetName, values: parsed.values.map(sanitize) }),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
      const result = await upstream.json().catch(() => null);
      if (!upstream.ok || result?.status !== 'success') {
        // Log only the status and Apps Script's own message; never the URL or token.
        console.error(`[api/sheets] upstream rejected the write (HTTP ${upstream.status}): ${result?.message ?? 'no JSON body'}`);
        return error(502, 'The sheet did not accept the row.');
      }
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
      const timedOut = (err as Error)?.name === 'TimeoutError';
      console.error(`[api/sheets] upstream request failed: ${timedOut ? 'timeout' : (err as Error)?.name}`);
      return error(timedOut ? 504 : 502, timedOut ? 'The sheet did not respond in time.' : 'Could not reach the sheet.');
    }
  },
};
