import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const STAGES = [
  "order_received",
  "order_ready",
  "order_packed",
  "order_dispatched",
  "at_airport",
  "arrived_destination",
  "on_the_way",
  "delivered",
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const order_id = String(body.order_id || "").trim();
    if (!order_id) return Response.json({ error: "order_id is required" }, { status: 400 });

    const tracking_number = body.tracking_number != null ? String(body.tracking_number).trim() : undefined;
    const carrier = body.carrier != null ? String(body.carrier).trim() : undefined;
    const tracking_status = body.tracking_status != null ? String(body.tracking_status).trim() : undefined;
    const note = body.note != null ? String(body.note).trim() : "";

    if (tracking_status && !STAGES.includes(tracking_status)) {
      return Response.json({ error: "Invalid tracking status" }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Order.get(order_id);

    const updates = {};
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (carrier !== undefined) updates.carrier = carrier;
    if (tracking_status) {
      updates.tracking_status = tracking_status;
      const history = Array.isArray(existing.tracking_history) ? existing.tracking_history : [];
      history.push({ status: tracking_status, note, timestamp: new Date().toISOString() });
      updates.tracking_history = history;
    }

    const order = await base44.asServiceRole.entities.Order.update(order_id, updates);

    // Email the customer their tracking number when it is first assigned
    if (tracking_number && !existing.tracking_number && order.customer_email) {
      try {
        const trackUrl = `https://usa-wishlist.base44.app/track?tracking=${encodeURIComponent(tracking_number)}`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: order.customer_email,
          subject: `Your tracking number for order ${order.order_number || order_id}`,
          body: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;color:#111;">
            <h2 style="font-size:20px;margin-bottom:8px;">USA Wishlist</h2>
            <p>Hi ${order.customer_name || "there"},</p>
            <p>Your order has been assigned a tracking number. Use it to follow your shipment's journey.</p>
            <p style="margin:16px 0;padding:12px;background:#f5f5f5;border-radius:6px;font-size:14px;">Tracking number: <strong>${tracking_number}</strong>${order.carrier ? ` (${order.carrier})` : ""}</p>
            <p style="font-size:13px;color:#555;">Track your order here: <a href="${trackUrl}" style="color:#0066ff;">${trackUrl}</a></p>
            <p style="color:#777;font-size:13px;margin-top:24px;">USA Wishlist</p>
          </div>`,
        });
      } catch (e) {
        console.error("tracking number email failed:", e);
      }
    }

    return Response.json({ ok: true, order });
  } catch (error) {
    console.error("updateOrderTracking error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}