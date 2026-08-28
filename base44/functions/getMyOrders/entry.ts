import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });
    const orders = await base44.asServiceRole.entities.Order.filter({ customer_email: email });
    const mapped = orders.map((o) => ({
      id: o.id,
      order_number: o.order_number || "",
      created_date: o.created_date,
      status: o.status || "pending",
      total: o.total ?? 0,
      tracking_number: o.tracking_number || "",
      carrier: o.carrier || "",
      items: (o.items || []).map((i) => ({ name: i.name, image: i.image, quantity: i.quantity, price: i.price })),
    }));
    mapped.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    return Response.json({ orders: mapped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}