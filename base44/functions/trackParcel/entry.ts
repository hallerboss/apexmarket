import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const trackingNumber = String(body.tracking_number || "").trim();
    const carrier = String(body.carrier || "").trim();
    if (!trackingNumber) {
      return Response.json({ error: "Tracking number is required" }, { status: 400 });
    }

    const schema = {
      type: "object",
      properties: {
        status: { type: "string" },
        current_status_label: { type: "string" },
        current_status_detail: { type: "string" },
        current_timestamp: { type: "string" },
        estimated_delivery: { type: "string" },
        carrier: { type: "string" },
        shipping_method: { type: "string" },
        progress_percent: { type: "number" },
        destination_address: { type: "string" },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              detail: { type: "string" },
              timestamp: { type: "string" },
              reached: { type: "boolean" }
            },
            required: ["title", "timestamp"]
          }
        }
      },
      required: ["current_status_label", "events"]
    };

    const prompt = `You are a parcel tracking assistant. Use web search to find the current LIVE tracking status for a shipment with tracking number "${trackingNumber}"${carrier ? ` shipped via ${carrier}` : ""}. Search and prioritize the parcelsapp.com tracking page (https://parcelsapp.com/en/tracking/${trackingNumber}) and the carrier's official tracking website. Return the most recent tracking events in newest-first order (each with a short title, optional detail, and timestamp), the current status label (e.g. "In transit", "Out for delivery", "Delivered", "Pending"), a short current status detail, an estimated delivery date or range, the carrier name, the shipping method, a progress percentage from 0 to 100, and the destination address if known. If the number is not trackable or not found online, set current_status_label to "Pending", put an explanation in current_status_detail, progress_percent to 0, and return an empty events array. Do not invent specific city or address details that were not found. Return only JSON.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: schema,
    });

    return Response.json({ tracking_number: trackingNumber, ...(result || {}) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}