import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Package, Truck, MapPin, Loader2 } from "lucide-react";
import OrderTrackingTimeline from "@/components/store/OrderTrackingTimeline";
import { getMyTracking } from "@/lib/myTracking";

export default function TrackOrder() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const [input, setInput] = useState(params.get("tracking") || params.get("order") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myNumbers, setMyNumbers] = useState([]);

  const lookup = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await base44.functions.invoke("getOrderTracking", {
        order_number: query.trim(),
        tracking_number: query.trim(),
      });
      setOrder(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "We couldn't find an order with that number. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMyNumbers(getMyTracking());
    const orderParam = params.get("order");
    const tn = params.get("tracking");
    const q = tn || orderParam;
    if (q) lookup(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#eee] z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-[#f5f5f5] rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-black">Track Your Order</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div>
          <p className="text-sm text-[#666] mb-3">
            Enter your order number or tracking number to see live status updates — from packed, to dispatched, to delivered.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); lookup(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Order number or tracking number"
              className="flex-1 border border-[#e0e0e0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0066ff]"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-[#0066ff] text-white px-6 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Track
            </button>
          </form>

          {myNumbers.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#808080] mb-2">Your orders — tap a number for live updates</p>
              <div className="flex flex-wrap gap-2">
                {myNumbers.map((n) => {
                  const value = n.tracking_number || n.order_number;
                  return (
                    <button
                      key={n.order_number}
                      type="button"
                      onClick={() => { setInput(value); lookup(value); }}
                      className="border border-[#e0e0e0] rounded-lg px-3 py-2 text-left hover:border-[#0066ff] hover:text-[#0066ff] transition-colors"
                    >
                      <span className="block text-sm font-semibold text-black">{value}</span>
                      <span className="block text-[11px] text-[#808080]">Order {n.order_number}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

        {loading && (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#eee] border-t-[#0066ff] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#808080]">Fetching your order status…</p>
          </div>
        )}

        {order && !loading && (
          <>
            {/* Order summary */}
            <div className="rounded-xl border border-[#eee] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0066ff]" />
                <p className="text-sm font-semibold text-black">Order {order.order_number}</p>
              </div>
              {order.tracking_number && (
                <p className="text-sm text-[#666]">Tracking #: <span className="text-black font-medium">{order.tracking_number}</span></p>
              )}
              {order.carrier && <p className="text-sm text-[#666]">Carrier: {order.carrier}</p>}
              {order.shipping_address && (
                <p className="text-sm text-[#666] flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {order.shipping_address}
                </p>
              )}
            </div>

            {order.tracking_number ? (
              <OrderTrackingTimeline
                history={order.tracking_history || []}
                currentStatus={order.tracking_status}
                trackingNumber={order.tracking_number}
                carrier={order.carrier}
              />
            ) : (
              <div className="rounded-xl border border-[#eee] p-6 text-center">
                <Truck className="w-8 h-8 text-[#bbb] mx-auto mb-2" />
                <p className="text-sm text-[#666]">Your order has been received. A tracking number and live updates will appear here once your parcel ships.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}