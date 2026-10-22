import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const API = 'https://www.googleapis.com/webmasters/v3';

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

    const sitesRes = await fetch(`${API}/sites`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!sitesRes.ok) {
      const detail = await sitesRes.text();
      console.error('Search Console sites error', sitesRes.status, detail);
      return Response.json({ error: 'Could not read your Search Console properties', detail: detail.slice(0, 300) }, { status: 502 });
    }
    const sitesBody = await sitesRes.json();
    const sites = (sitesBody.siteEntry || []).map((s) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel }));
    if (sites.length === 0) return Response.json({ sites: [], site: null });

    const payload = await req.json().catch(() => ({}));
    const requested = payload?.site;
    const site = sites.some((s) => s.siteUrl === requested) ? requested : sites[0].siteUrl;

    const range = { startDate: isoDaysAgo(31), endDate: isoDaysAgo(3) };
    const query = async (dimensions, rowLimit) => {
      const res = await fetch(`${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...range, dimensions, rowLimit }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error('Search Console query error', res.status, detail);
        throw new Error(detail.slice(0, 300));
      }
      return (await res.json()).rows || [];
    };

    const [totalsRows, queryRows, pageRows] = await Promise.all([
      query(undefined, 1),
      query(['query'], 10),
      query(['page'], 10),
    ]);

    const t = totalsRows[0] || {};
    return Response.json({
      site,
      sites,
      range,
      totals: {
        clicks: Math.round(t.clicks || 0),
        impressions: Math.round(t.impressions || 0),
        ctr: t.ctr || 0,
        position: t.position || 0,
      },
      topQueries: queryRows.map((r) => ({
        label: r.keys?.[0] || '',
        clicks: Math.round(r.clicks || 0),
        impressions: Math.round(r.impressions || 0),
        ctr: r.ctr || 0,
        position: r.position || 0,
      })),
      topPages: pageRows.map((r) => ({
        label: r.keys?.[0] || '',
        clicks: Math.round(r.clicks || 0),
        impressions: Math.round(r.impressions || 0),
        ctr: r.ctr || 0,
        position: r.position || 0,
      })),
    });
  } catch (error) {
    console.error('getSearchConsoleStats failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}