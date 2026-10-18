import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const path = String(body?.path || '').trim().slice(0, 300);
    const visitorId = String(body?.visitor_id || '').trim().slice(0, 64);
    if (!path || !visitorId) return Response.json({ ok: false }, { status: 400 });

    const productId = body?.product_id ? String(body.product_id).slice(0, 64) : '';

    await Promise.all([
      base44.asServiceRole.entities.PageView.create({
        path,
        visitor_id: visitorId,
        ...(productId ? { product_id: productId } : {}),
      }),
      base44.asServiceRole.entities.Visitor.upsert(
        [{ visitor_id: visitorId, last_seen: new Date().toISOString() }],
        { key: 'visitor_id' }
      ),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}