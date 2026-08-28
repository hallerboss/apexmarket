import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const order_id = String(body.order_id || "").trim();
    const tracking_number = String(body.tracking_number || "").trim();
    const carrier = String(body.carrier || "").trim();
    if (!order_id) return Response.json({ error: "order_id is required" }, { status: 400 });

    const order = await base44.asServiceRole.entities.Order.update(order_id, { tracking_number, carrier });

    return Response.json({ ok: true, order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}