import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { secrets } from "base44:runtime";

function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function toBase64Url(ascii) {
  return utf8ToBase64(ascii).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildOrderEmail(order) {
  const items = (order.items || [])
    .map((it) => `- ${it.name} x${it.quantity} -- $${(it.price * it.quantity).toFixed(2)}`)
    .join("\n");
  const body =
    `Hi ${order.customer_name || "there"},\n\n` +
    `Thank you for your order at ApexMarket! Your payment has been confirmed and we're now preparing your items for shipment.\n\n` +
    `Order Number: ${order.order_number || "--"}\n` +
    `Subtotal: $${(order.subtotal || 0).toFixed(2)}\n` +
    `Shipping: ${order.shipping ? "$" + Number(order.shipping).toFixed(2) : "Free"}\n` +
    `Total: $${(order.total || 0).toFixed(2)}\n\n` +
    `Shipping Address:\n${order.shipping_address || "--"}\n\n` +
    `Items:\n${items}\n\n` +
    `We'll send you another email with tracking once your order ships. If you have any questions, just reply to this email.\n\n` +
    `Thank you for shopping with us!\n` +
    `The ApexMarket Team`;
  const headers = [
    "To: " + order.customer_email,
    "Subject: Your ApexMarket order is confirmed",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
  ].join("\r\n");
  return toBase64Url(headers + "\r\n\r\n" + utf8ToBase64(body));
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!secret) {
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    const parts = {};
    signature.split(",").forEach((p) => {
      const [k, v] = p.split("=");
      parts[k] = v;
    });
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
      const email = session.customer_details?.email || session.customer_email || "";
      if (orderId) {
        await base44.asServiceRole.entities.Order.update(orderId, {
          status: "processing",
          payment_method: "Stripe",
          ...(email ? { customer_email: email } : {}),
        });
      }
      if (orderId) {
        try {
          const order = await base44.asServiceRole.entities.Order.get(orderId);
          if (order) {
            const itemsList = (order.items || [])
              .map((it) => `- ${it.name} x${it.quantity} — $${(it.price * it.quantity).toFixed(2)}`)
              .join("\n");

            // Admin notification — new order alert
            try {
              const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" }, "-created_date", 10);
              const adminHtml = `<h2>New Order — ${order.order_number || orderId}</h2>
                <p><strong>Customer:</strong> ${order.customer_name || "—"}</p>
                <p><strong>Email:</strong> ${email || order.customer_email || "—"}</p>
                <p><strong>Phone:</strong> ${order.customer_phone || "—"}</p>
                <p><strong>Shipping Address:</strong> ${order.shipping_address || "—"}</p>
                <p><strong>Total:</strong> $${(order.total || 0).toFixed(2)}</p>
                <h3>Items:</h3><pre>${itemsList}</pre>`;
              for (const a of admins) {
                if (a.email) {
                  await base44.asServiceRole.integrations.Core.SendEmail({
                    to: a.email,
                    subject: `New Order — ${order.order_number || orderId}`,
                    html: adminHtml,
                  });
                }
              }
            } catch (adminErr) {
              console.error("Admin notification email failed:", adminErr?.message || adminErr);
            }

            // Customer confirmation
            const customerEmail = email || order.customer_email;
            if (customerEmail) {
              try {
                const customerHtml = `<h2>Thank you for your order at ApexMarket!</h2>
                  <p>Hi ${order.customer_name || "there"},</p>
                  <p>Your payment has been confirmed and we're preparing your items for shipment.</p>
                  <p><strong>Order Number:</strong> ${order.order_number || "—"}</p>
                  <p><strong>Total:</strong> $${(order.total || 0).toFixed(2)}</p>
                  <h3>Items:</h3><pre>${itemsList}</pre>
                  <p>We'll send you tracking information once your order ships.</p>
                  <p>Thank you for shopping with us!<br>The ApexMarket Team</p>`;
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: customerEmail,
                  subject: "Your ApexMarket order is confirmed",
                  html: customerHtml,
                });
              } catch (custErr) {
                console.error("Customer confirmation email failed:", custErr?.message || custErr);
              }
            }

            // Increment total_sales for ordered products
            try {
              for (const item of (order.items || [])) {
                if (item.product_id) {
                  const p = await base44.asServiceRole.entities.Product.get(item.product_id).catch(() => null);
                  if (p) {
                    await base44.asServiceRole.entities.Product.update(item.product_id, {
                      total_sales: (p.total_sales || 0) + (item.quantity || 1)
                    });
                  }
                }
              }
            } catch (salesErr) {
              console.error("Failed to update total_sales:", salesErr?.message || salesErr);
            }
          }
        } catch (mailErr) {
          console.error("Order email notification failed:", mailErr?.message || mailErr);
        }
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}