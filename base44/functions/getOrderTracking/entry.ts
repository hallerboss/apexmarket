import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const orderNumber = String(body.order_number || "").trim();
    if (!orderNumber) {
      return Response.json({ error: "Order number is required" }, { status: 400 });
    }
    const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
    const order = orders[0];
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    return Response.json({
      order_number: order.order_number,
      tracking_number: order.tracking_number || "",
      carrier: order.carrier || "",
      shipping_address: order.shipping_address || "",
      status: order.status || "",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}