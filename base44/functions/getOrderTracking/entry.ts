import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const orderNumber = String(body.order_number || "").trim();
    const trackingNumber = String(body.tracking_number || "").trim();
    if (!orderNumber && !trackingNumber) {
      return Response.json({ error: "Order number or tracking number is required" }, { status: 400 });
    }
    let order = null;
    if (orderNumber) {
      const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
      order = orders[0];
    }
    if (!order && trackingNumber) {
      const orders = await base44.asServiceRole.entities.Order.filter({ tracking_number: trackingNumber });
      order = orders[0];
    }
    if (!order) {
      return Response.json({ error: "We couldn't find an order with that number. Please check and try again." }, { status: 404 });
    }
    return Response.json({
      order_number: order.order_number,
      tracking_number: order.tracking_number || "",
      carrier: order.carrier || "",
      shipping_address: order.shipping_address || "",
      status: order.status || "",
      tracking_status: order.tracking_status || "",
      tracking_history: order.tracking_history || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}