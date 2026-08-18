import { secrets } from "base44:runtime";

export default async function(req) {
  try {
    const body = await req.json();
    const { order_id, items, customer_email, shipping, success_url, cancel_url } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "No items provided" }, { status: 400 });
    }
    if (!success_url || !cancel_url) {
      return Response.json({ error: "success_url and cancel_url are required" }, { status: 400 });
    }
    const secretKey = secrets.get("STRIPE_SECRET_KEY");
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", success_url);
    params.append("cancel_url", cancel_url);
    if (customer_email) params.append("customer_email", customer_email);
    items.forEach((item, i) => {
      params.append(`line_items[${i}][quantity]`, String(item.quantity));
      params.append(`line_items[${i}][price_data][currency]`, "usd");
      params.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
      params.append(`line_items[${i}][price_data][product_data][name]`, item.name);
    });
    if (shipping && shipping > 0) {
      const idx = items.length;
      params.append(`line_items[${idx}][quantity]`, "1");
      params.append(`line_items[${idx}][price_data][currency]`, "usd");
      params.append(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(shipping * 100)));
      params.append(`line_items[${idx}][price_data][product_data][name]`, "Shipping");
    }
    params.append("metadata[base44_app_id]", secrets.get("BASE44_APP_ID"));
    if (order_id) params.append("metadata[order_id]", order_id);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Stripe-Version": "2025-10-29.clover",
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Stripe checkout error:", data);
      return Response.json({ error: data.error?.message || "Stripe error" }, { status: 400 });
    }
    return Response.json({ url: data.url });
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}