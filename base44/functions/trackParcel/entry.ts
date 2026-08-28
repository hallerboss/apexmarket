import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { appendOrderRow } from "../../shared/sheetsLog.ts";

const API_URL = "https://api.parcelapp.net/v3/shipments/tracking";

function statusProgress(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return 100;
  if (s.includes("out_for") || s.includes("delivery")) return 88;
  if (s === "pending" || s === "not_found" || s === "unknown" || s === "processing") return 6;
  return 55;
}

function mapShipment(s) {
  const cps = (s.checkpoints || []).slice().sort((a, b) => new Date(b.checkpoint_time) - new Date(a.checkpoint_time));
  const events = cps.map((c) => ({
    title: c.status_label || c.substatus_label || c.status || "Update",
    detail: [c.message, c.location].filter(Boolean).join(" — "),
    timestamp: c.checkpoint_time || "",
    reached: true,
  }));
  const current = events[0] || null;
  return {
    status: s.status || (current ? "found" : "pending"),
    current_status_label: current?.title || (s.status === "delivered" ? "Delivered" : s.status === "pending" ? "Pending" : "In transit"),
    current_status_detail: current?.detail || "",
    current_timestamp: current?.timestamp || "",
    estimated_delivery: s.eta || "",
    carrier: (s.carrier && (s.carrier.name || s.carrier.code)) || "",
    shipping_method: (s.carrier && s.carrier.name) || "Standard Shipping",
    progress_percent: statusProgress(s.status),
    destination_address: (s.destination_country && (s.destination_country.name || s.destination_country.code)) || "",
    events,
  };
}

async function callParcelsApp(trackingNumber, carrier) {
  const key = process.env.PARCELSAPP_API_KEY;
  if (!key) return null;
  const shipment = { tracking_number: trackingNumber, language: "en" };
  if (carrier) shipment.carrier = carrier.toLowerCase();
  const r = await fetch(API_URL, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ shipments: [shipment] }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  let s = (data.shipments || [])[0];
  if (s && ["pending", "unknown", "processing"].includes(s.status) && data.request_id) {
    for (let i = 0; i < 5; i++) {
      await new Promise((res) => setTimeout(res, 3000));
      const pr = await fetch(`${API_URL}?request_id=${data.request_id}`, { headers: { "X-API-Key": key } });
      if (!pr.ok) break;
      const pd = await pr.json();
      s = (pd.shipments || [])[0] || s;
      if (s && !["pending", "unknown", "processing"].includes(s.status)) break;
    }
  }
  if (!s) return null;
  return mapShipment(s);
}

async function webSearchFallback(base44, trackingNumber, carrier) {
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
  return await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a parcel tracking assistant. Use web search to find the current LIVE tracking status for a shipment with tracking number "${trackingNumber}"${carrier ? ` shipped via ${carrier}` : ""}. Search and prioritize the parcelsapp.com tracking page (https://parcelsapp.com/en/tracking/${trackingNumber}) and the carrier's official tracking website. Return the most recent tracking events in newest-first order (each with a short title, optional detail, and timestamp), the current status label, a short current status detail, an estimated delivery date, the carrier name, the shipping method, a progress percentage from 0 to 100, and the destination address if known. If the number is not trackable, set current_status_label to "Pending", progress_percent to 0, and return an empty events array. Do not invent details that were not found. Return only JSON.`,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: schema,
  });
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const trackingNumber = String(body.tracking_number || "").trim();
    const carrier = String(body.carrier || "").trim();
    if (!trackingNumber) return Response.json({ error: "Tracking number is required" }, { status: 400 });

    let result = null;
    let source = "parcelsapp";
    try { result = await callParcelsApp(trackingNumber, carrier); } catch (e) { console.error("parcelsapp error:", e?.message || e); }
    if (!result || (result.events && result.events.length === 0 && ["pending", "not_found", "unknown"].includes(result.status))) {
      try {
        const fb = await webSearchFallback(base44, trackingNumber, carrier);
        if (fb && fb.events && fb.events.length > 0) { result = fb; source = "web"; }
      } catch (e) { console.error("fallback error:", e?.message || e); }
    }
    if (!result) return Response.json({ error: "Unable to fetch tracking" }, { status: 502 });

    // Log delivery status update to Google Sheets (best-effort)
    try {
      await appendOrderRow(base44, [
        new Date().toISOString(),
        "",
        "",
        trackingNumber,
        result.carrier || carrier || "",
        result.current_status_label || "",
        result.estimated_delivery || "",
        `Delivery status update: ${result.status || ""}`,
      ]);
    } catch (e) { console.error("sheets log error:", e?.message || e); }

    return Response.json({ tracking_number: trackingNumber, source, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}