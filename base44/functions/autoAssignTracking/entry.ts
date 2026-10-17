import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { waitUntil } from "base44:runtime";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const gen = () => `APX-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const all = await base44.asServiceRole.entities.Order.list("-created_date", 500);
    const items = Array.isArray(all) ? all : (all.items || []);
    const missing = items.filter((o) => !o.tracking_number);

    const result = [];
    for (const o of missing) {
      const tn = gen();
      await base44.asServiceRole.entities.Order.update(o.id, { tracking_number: tn });
      result.push({
        id: o.id,
        order_number: o.order_number,
        tracking_number: tn,
        customer_email: o.customer_email,
        customer_name: o.customer_name,
      });
    }

    // Email each customer their new tracking number (post-response)
    for (const r of result) {
      if (!r.customer_email) continue;
      waitUntil((async () => {
        try {
          const trackUrl = `https://apexmarket-app.base44.app/track?tracking=${encodeURIComponent(r.tracking_number)}`;
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: r.customer_email,
            subject: `Your tracking number for order ${r.order_number || r.id}`,
            body: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;color:#111;">
              <h2 style="font-size:20px;margin-bottom:8px;">USA Wishlist</h2>
              <p>Hi ${r.customer_name || "there"},</p>
              <p>Your order has been assigned a tracking number. Use it to follow your shipment's journey.</p>
              <p style="margin:16px 0;padding:12px;background:#f5f5f5;border-radius:6px;font-size:14px;">Tracking number: <strong>${r.tracking_number}</strong></p>
              <p style="font-size:13px;color:#555;">Track your order here: <a href="${trackUrl}" style="color:#0066ff;">${trackUrl}</a></p>
              <p style="color:#777;font-size:13px;margin-top:24px;">USA Wishlist</p>
            </div>`,
          });
        } catch (e) {
          console.error("auto tracking email failed:", e);
        }
      })());
    }

    return Response.json({ ok: true, assigned: result.length, orders: result });
  } catch (error) {
    console.error("autoAssignTracking error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}