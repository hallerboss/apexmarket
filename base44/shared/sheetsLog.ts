/**
 * Append a single row to the configured Google Sheet ("Orders" tab).
 * Best-effort: silently skips if the spreadsheet ID is not set or the
 * Google Sheets connector is not connected. Callers never fail because of this.
 */
export async function appendOrderRow(base44, values) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return { skipped: "no spreadsheet id configured" };
  try {
    const conn = await base44.asServiceRole.connectors.getConnection("googlesheets");
    const accessToken = conn?.accessToken;
    if (!accessToken) return { skipped: "no sheets connection" };
    const range = "Orders!A:J";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    });
    if (!r.ok) {
      const t = await r.text();
      return { error: t.slice(0, 300) };
    }
    return { ok: true };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
}