import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const TEMPLATES = {
  placed: {
    subject: "Your order has been placed — thank you for your purchase",
    line: "Your order has been placed. Thank you for your purchase!",
  },
  shipped: {
    subject: "Your order has been shipped",
    line: "Your order has been shipped and is on its way to you.",
  },
  delivered: {
    subject: "Your order has been delivered",
    line: "Your order has been delivered. We hope you enjoy your purchase!",
  },
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const { template, email, order_number, customer_name, tracking_number } = body || {};
    if (!template || !TEMPLATES[template]) {
      return Response.json({ error: "Invalid template" }, { status: 400 });
    }
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
    const t = TEMPLATES[template];
    const greeting = customer_name ? `Hi ${customer_name},` : "Hi,";
    const trackingHtml = tracking_number
      ? `<p style="margin:16px 0;padding:12px;background:#f5f5f5;border-radius:6px;font-size:13px;">Tracking number: <strong>${tracking_number}</strong></p>`
      : "";
    const orderHtml = order_number ? `<p style="color:#555;font-size:13px;">Order: <strong>${order_number}</strong></p>` : "";
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;color:#111;">
        <h2 style="font-size:20px;margin-bottom:8px;">Wolmart</h2>
        <p>${greeting}</p>
        <p style="font-size:16px;font-weight:600;">${t.line}</p>
        ${orderHtml}
        ${trackingHtml}
        <p style="color:#777;font-size:13px;margin-top:24px;">Wolmart — ApexMarket</p>
      </div>`;
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: t.subject,
      body: html,
    });
    return Response.json({ ok: true, sent_to: email });
  } catch (error) {
    console.error("sendOrderNotification error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}