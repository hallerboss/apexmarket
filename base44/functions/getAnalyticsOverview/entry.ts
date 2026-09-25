import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const conn = await base44.asServiceRole.connectors.getConnection('google_analytics');
    const accessToken = conn?.accessToken;
    if (!accessToken) return Response.json({ error: 'Google Analytics not connected' }, { status: 400 });

    // Resolve the first GA4 property in the connected account
    const adminRes = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!adminRes.ok) {
      const e = await adminRes.json().catch(() => ({}));
      return Response.json({ error: e?.error?.message || 'Failed to list GA properties' }, { status: 502 });
    }
    const adminData = await adminRes.json();
    const propertySummary = (adminData.accountSummaries || [])
      .flatMap((a) => a.propertySummaries || [])
      .find((p) => p.property && p.property.startsWith('properties/'));
    if (!propertySummary) {
      return Response.json({ error: 'No GA4 properties found in your Google Analytics account' }, { status: 400 });
    }
    const propertyResource = propertySummary.property;
    const propertyId = propertyResource.replace('properties/', '');

    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const dataApi = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Totals: visitors, sessions, page views
    const totalsRes = await fetch(dataApi, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dateRanges: [{ startDate: start, endDate: end }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
        ],
      }),
    });
    const totalsData = totalsRes.ok ? await totalsRes.json() : {};
    const totalsRow = totalsData?.rows?.[0]?.metricValues || {};
    const num = (v) => parseInt(v?.value || '0', 10) || 0;
    const visitors = num(totalsRow.activeUsers);
    const sessions = num(totalsRow.sessions);
    const pageViews = num(totalsRow.screenPageViews);

    // Top product pages by views
    const productsRes = await fetch(dataApi, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dateRanges: [{ startDate: start, endDate: end }],
        metrics: [{ name: 'screenPageViews' }],
        dimensions: [{ name: 'pagePath' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'CONTAINS', value: '/product/' },
          },
        },
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 20,
      }),
    });
    const productsData = productsRes.ok ? await productsRes.json() : {};
    const rows = productsData?.rows || [];

    // Aggregate views per product id, then resolve names
    const idToViews: Record<string, number> = {};
    for (const r of rows) {
      const path = r.dimensionValues?.[0]?.value || '';
      const match = path.match(/\/product\/([^/?#]+)/);
      if (!match) continue;
      const id = match[1];
      const views = num(r.metricValues?.[0]);
      idToViews[id] = (idToViews[id] || 0) + views;
    }

    const ids = Object.keys(idToViews);
    const products: any[] = [];
    if (ids.length) {
      const fetched = await Promise.all(
        ids.map((id) => base44.entities.Product.get(id).catch(() => null))
      );
      for (const p of fetched) {
        if (p && p.id && p.name) {
          products.push({ name: p.name, views: idToViews[p.id] });
        }
      }
    }
    products.sort((a, b) => b.views - a.views);

    return Response.json({
      property: propertyResource,
      visitors,
      sessions,
      pageViews,
      topProducts: products.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}