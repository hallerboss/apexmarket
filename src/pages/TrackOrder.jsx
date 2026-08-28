import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Info, Package, ShieldCheck, Home as HomeIcon, Copy, Check, ChevronDown, Search } from "lucide-react";

const GREEN = "#00A651";
const LGREEN = "#E8F8E8";
const ORANGE = "#FF6633";
const PEACH = "#FFF9F5";
const GREY = "#808080";

export default function TrackOrder() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const [input, setInput] = useState(params.get("tracking") || "");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const track = async (tn, carrier) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await base44.functions.invoke("trackParcel", { tracking_number: tn, carrier });
      setData(res.data);
      setTrackingNumber(tn);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to fetch tracking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const order = params.get("order");
    const tn = params.get("tracking");
    if (order) {
      (async () => {
        try {
          const res = await base44.functions.invoke("getOrderTracking", { order_number: order });
          const o = res.data;
          setOrderInfo(o);
          if (o.tracking_number) {
            setInput(o.tracking_number);
            track(o.tracking_number, o.carrier);
          } else {
            setError("No tracking number assigned to this order yet. Check back once the store confirms shipment.");
          }
        } catch (e) {
          setError("Order not found. Please enter your tracking number below.");
        }
      })();
    } else if (tn) {
      track(tn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = () => {
    navigator.clipboard?.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const events = data?.events || [];
  const current = events[0] || null;
  const history = events.slice(1).slice().reverse();
  const visibleHistory = showAll ? history : history.slice(0, 2);
  const progress = Math.max(0, Math.min(100, data?.progress_percent || 0));
  const reachedIdx = progress >= 90 ? 2 : progress >= 45 ? 1 : 0;
  const milestones = ["Arrived at airport", "Departed", "Arrived at destination country"];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#eee] z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-[#f5f5f5] rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-black">Tracking</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) track(input.trim(), orderInfo?.carrier); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1 border border-[#e0e0e0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0066ff]"
          />
          <button type="submit" disabled={loading || !input.trim()} className="bg-[#0066ff] text-white px-6 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            <Search className="w-4 h-4" /> {loading ? "Tracking…" : "Track"}
          </button>
        </form>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

        {loading && (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#eee] border-t-[#0066ff] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#808080]">Searching the web for your parcel…</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Delivery banner */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: LGREEN }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-black">Delivery: {data.estimated_delivery || "Calculating…"}</p>
                <span className="w-5 h-5 rounded-full bg-white/70 flex items-center justify-center">
                  <Info className="w-3 h-3" style={{ color: GREEN }} />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" style={{ color: GREEN }} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: GREEN }}>Fast delivery</p>
                  <p className="text-xs" style={{ color: "#1b6e3b" }}>
                    Apply for $1.00 coupon code if delayed by {data.estimated_delivery || "the estimated date"}
                  </p>
                </div>
              </div>
              <span className="absolute right-3 top-3 bg-white/80 rounded-md px-2 py-1 flex items-center gap-1 text-xs font-semibold" style={{ color: GREEN }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Protection
              </span>
            </div>

            {/* Tracking details */}
            <div className="space-y-1">
              <p className="text-xs" style={{ color: GREY }}>{data.shipping_method || data.carrier || "Standard Shipping"}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-black">Tracking number: {trackingNumber}</span>
                <button onClick={copy} className="text-[#0066ff] text-sm font-medium flex items-center gap-1">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6">
              {/* vertical line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#e0e0e0]" />

              {/* Current state */}
              <div className="relative mb-5">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-black border-2 border-white shadow" />
                <p className="text-base font-bold text-black">{current?.title || data.current_status_label || "In transit"}</p>
                {current?.detail && <p className="text-sm" style={{ color: GREY }}>{current.detail}</p>}
                <p className="text-xs mt-0.5" style={{ color: GREY }}>{current?.timestamp || data.current_timestamp || ""}</p>
              </div>

              {/* Progress card */}
              <div className="relative mb-5 -ml-6 rounded-xl p-4" style={{ background: PEACH }}>
                <p className="text-sm text-black mb-3">{data.current_status_detail || "Heading to the destination country"}</p>
                <div className="relative h-1.5 bg-[#f0e4da] rounded-full mb-2">
                  <div className="absolute left-0 top-0 h-1.5 rounded-full" style={{ width: `${progress}%`, background: ORANGE }} />
                </div>
                <div className="flex justify-between text-[11px]">
                  {milestones.map((m, i) => (
                    <span key={m} className={i <= reachedIdx ? "font-bold" : ""} style={{ color: i <= reachedIdx ? ORANGE : GREY, maxWidth: "32%", textAlign: i === 0 ? "left" : i === 2 ? "right" : "center" }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* History */}
              {visibleHistory.map((ev, i) => (
                <div key={i} className="relative mb-4">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#d8d8d8] border-2 border-white" />
                  <p className="text-sm text-black">{ev.title}</p>
                  {ev.detail && <p className="text-xs" style={{ color: GREY }}>{ev.detail}</p>}
                  <p className="text-xs mt-0.5" style={{ color: GREY }}>{ev.timestamp}</p>
                </div>
              ))}

              {history.length > 2 && (
                <button onClick={() => setShowAll((s) => !s)} className="flex items-center gap-1 text-sm ml-0" style={{ color: GREY }}>
                  {showAll ? "View less" : "View more"} <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Destination address */}
            {(data.destination_address || orderInfo?.shipping_address) && (
              <div className="rounded-xl border border-[#eee] p-4 flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                  <HomeIcon className="w-4 h-4" style={{ color: GREEN }} />
                </span>
                <div>
                  <p className="text-sm font-medium text-black">Shipping address</p>
                  <p className="text-sm" style={{ color: GREY }}>{data.destination_address || orderInfo.shipping_address}</p>
                </div>
              </div>
            )}

            <a href={`https://parcelsapp.com/en/tracking/${trackingNumber}`} target="_blank" rel="noreferrer" className="block text-center text-sm text-[#0066ff] font-medium py-3">
              View full tracking on parcelsapp.com →
            </a>
          </>
        )}
      </div>
    </div>
  );
}