import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";

function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!secret) {
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    const parts = {};
    signature.split(",").forEach((p) => { const [k, v] = p.split("="); parts[k] = v; });
    if (!parts.t || !parts.v1) {
      return Response.json({ error: "Invalid signature header" }, { status: 400 });
    }
    const signedPayload = `${parts.t}.${body}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, hexToArrayBuffer(parts.v1), enc.encode(signedPayload));
    if (!valid) {
      return Response.json({ error: "Signature verification failed" }, { status: 400 });
    }
    const event = JSON.parse(body);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await base44.asServiceRole.entities.Order.update(orderId, {
          status: "processing",
          payment_method: "Stripe",
        });
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}