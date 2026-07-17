// Write-only backup log to Google Sheets via Apps Script.
// Reading data back from the sheet is intentionally NOT supported here:
// customer data must only be readable by authenticated admins (via Supabase).
// See docs/google-apps-script.gs for the matching server-side script.

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
const SHEETS_TOKEN = import.meta.env.VITE_SHEETS_TOKEN as string | undefined;

export const appendToSheet = async (sheetName: string, data: any[]) => {
  if (!APPS_SCRIPT_URL) return;

  // Prevent spreadsheet formula injection
  const sanitized = data.map((v) => {
    if (typeof v === 'string') {
      const t = v.trim();
      if (!t.startsWith("'") && (t.startsWith('+') || t.startsWith('=') || t.startsWith('-') || t.startsWith('@'))) {
        return `'${t}`;
      }
    }
    return v;
  });

  try {
    // 'no-cors' keeps this a simple request that Apps Script accepts without preflight.
    // The response body is opaque; this is a best-effort backup log only.
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      redirect: 'follow',
      body: JSON.stringify({ token: SHEETS_TOKEN, sheetName, values: sanitized }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
  } catch (error) {
    // Never block the user on the backup log
    console.error('Sheets backup log failed:', error);
  }
};
