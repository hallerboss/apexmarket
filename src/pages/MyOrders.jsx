import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Package, Truck, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useCurrency } from "@/lib/currencyContext";

const statusColor = {
  pending: "#f59e0b", processing: "#3b82f6", shipped: "#8b5cf6", delivered: "#16a34a", cancelled: "#ef4444",
};

export default function MyOrders() {
  const { formatPrice } = useCurrency();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("getMyOrders", { email: email.trim() });
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-[#eee] z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="p-1.5 hover:bg-[#f5f5f5] rounded-full"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-bold text-black">My Orders</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={load} className="flex gap-2 mb-6">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Enter your email to view orders"
            className="flex-1 border border-[#e0e0e0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0066ff]"
          />
          <button type="submit" disabled={loading} className="bg-[#0066ff] text-white px-6 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            <Search className="w-4 h-4" /> {loading ? "Loading…" : "View"}
          </button>
        </form>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        {orders !== null && (
          orders.length === 0 ? (
            <div className="text-center py-16 text-[#808080]">
              <Package className="w-10 h-10 mx-auto mb-3 text-[#ccc]" />
              <p className="text-sm">No orders found for this email.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-[#eee] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border-b border-[#eee]">
                    <div>
                      <p className="text-sm font-semibold text-black">Order {o.order_number || o.id.slice(0, 8)}</p>
                      <p className="text-xs text-[#808080]">{o.created_date ? new Date(o.created_date).toLocaleDateString() : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: statusColor[o.status] || "#888" }}>{o.status}</span>
                      <p className="text-sm font-bold text-black mt-1">{formatPrice(o.total || 0)}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 flex-wrap items-center mb-3">
                      {o.items.slice(0, 5).map((it, i) => (
                        <div key={i} className="w-12 h-12 rounded-md overflow-hidden bg-[#f5f5f5] shrink-0">
                          {it.image ? <Image src={it.image} alt="" className="w-full h-full object-cover" fittingType="fill" /> : <div className="w-full h-full" />}
                        </div>
                      ))}
                      <span className="text-xs text-[#808080]">{o.items.reduce((s, i) => s + (i.quantity || 0), 0)} item(s)</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#eee] pt-3">
                      <div className="flex items-center gap-2 text-xs text-[#808080] min-w-0">
                        {o.tracking_number ? (
                          <><Truck className="w-4 h-4 text-[#16a34a] shrink-0" /> <span className="truncate">Tracking: {o.tracking_number}</span></>
                        ) : (
                          <><Package className="w-4 h-4 shrink-0" /> No tracking yet</>
                        )}
                      </div>
                      {o.tracking_number ? (
                        <Link to={`/track?tracking=${encodeURIComponent(o.tracking_number)}`} className="text-[#0066ff] text-sm font-medium flex items-center gap-1 shrink-0">
                          <MapPin className="w-4 h-4" /> Track
                        </Link>
                      ) : (
                        <span className="text-xs text-[#bbb]">Awaiting shipment</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}