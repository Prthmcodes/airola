/**
 * Airola — Google Sheets backup log (SECURED VERSION)
 *
 * How to install:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Replace the existing code with this file.
 * 3. Set SECRET_TOKEN below to the same value as VITE_SHEETS_TOKEN in the site's .env
 *    (change both from the default!).
 * 4. Deploy -> Manage deployments -> Edit -> New version -> Deploy.
 *
 * What changed vs the old script:
 * - doGet (public READ of all customer data) has been REMOVED. Nobody can download
 *   your sheet through this URL anymore. The admin dashboard now reads from Supabase.
 * - doPost now requires the secret token, so random visitors can't spam rows into
 *   your sheet even if they discover the URL.
 */

var SECRET_TOKEN = 'airola-sheets-2026-CHANGE-ME';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (!payload.token || payload.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(payload.sheetName);
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow(payload.values);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Intentionally no doGet: public reads are disabled.
