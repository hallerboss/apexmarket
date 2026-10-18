import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const starts: Record<string, string> = {
      today: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString(),
      week: new Date(now.getTime() - 6 * day).toISOString(),
      month: new Date(now.getTime() - 29 * day).toISOString(),
      year: new Date(now.getTime() - 364 * day).toISOString(),
    };
    const keys = ['today', 'week', 'month', 'year'];

    // Unique visitors per period (one Visitor record per visitor, last_seen refreshed on each page view)
    const visitorCounts = [];
    for (const k of keys) {
      const n = await base44.asServiceRole.entities.Visitor
        .count({ last_seen: { $gte: starts[k] } })
        .catch(() => 0);
      visitorCounts.push(n || 0);
    }

    // Product page views per period
    const productCounts = [];
    for (const k of keys) {
      const n = await base44.asServiceRole.entities.PageView
        .count({ product_id: { $ne: null }, created_date: { $gte: starts[k] } })
        .catch(() => 0);
      productCounts.push(n || 0);
    }

    const visitorsByRange: Record<string, number> = {};
    const productViewsByRange: Record<string, number> = {};
    keys.forEach((k, i) => {
      visitorsByRange[k] = visitorCounts[i];
      productViewsByRange[k] = productCounts[i];
    });

    return Response.json({ visitorsByRange, productViewsByRange });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}