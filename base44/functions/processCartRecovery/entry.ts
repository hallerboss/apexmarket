import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const origin = req.headers.get("origin") || "https://apexmarket-app.base44.app";

    // Find pending orders with email that haven't had recovery sent
    const pendingOrders = await base44.asServiceRole.entities.Order.filter(
      { status: "pending", recovery_sent: { $ne: true } },
      "created_date",
      50
    );

    // Only process orders older than 2 hours (abandoned)
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const abandoned = pendingOrders.filter(
      (o) => o.customer_email && new Date(o.created_date).getTime() < twoHoursAgo
    );

    let processed = 0;
    for (const order of abandoned) {
      try {
        const itemsList = (order.items || [])
          .map((it) => `<li>${it.name} ×${it.quantity} — $${(it.price * it.quantity).toFixed(2)}</li>`)
          .join("");

        const html = `<h2>You left items in your cart! 🛒</h2>
          <p>Hi ${order.customer_name || "there"},</p>
          <p>We noticed you didn't finish your purchase at ApexMarket. Your items are still waiting for you!</p>
          <h3>Items in your cart:</h3>
          <ul>${itemsList}</ul>
          <p><strong>Total:</strong> $${(order.total || 0).toFixed(2)}</p>
          <p style="margin:24px 0;">
            <a href="${origin}/cart" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">Complete Your Purchase →</a>
          </p>
          <p style="color:#777;font-size:13px;">If you have any questions, we're here to help. Just reply to this email.</p>
          <p style="color:#777;font-size:13px;">The ApexMarket Team</p>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: order.customer_email,
          subject: "You left items in your cart — complete your purchase!",
          html: html,
        });

        await base44.asServiceRole.entities.Order.update(order.id, { recovery_sent: true });
        processed++;
      } catch (err) {
        console.error("Recovery email failed for order", order.id, err?.message || err);
      }
    }

    return Response.json({ ok: true, processed, found: abandoned.length });
  } catch (error) {
    console.error("processCartRecovery error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}