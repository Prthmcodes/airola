// Write-only backup log to Google Sheets, via the server-side proxy in api/sheets.ts.
// The Apps Script URL and its secret token stay on the server; nothing secret is in the browser bundle.
// Reading data back from the sheet is intentionally NOT supported here:
// customer data must only be readable by authenticated admins (via Supabase).
// See docs/google-apps-script.gs for the matching Apps Script.

export const appendToSheet = async (sheetName: 'Sheet1' | 'Sheet2', data: any[]) => {
  try {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetName, values: data }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      console.error('Sheets backup log failed:', error);
    }
  } catch (error) {
    // Never block the user on the backup log
    console.error('Sheets backup log failed:', error);
  }
};
