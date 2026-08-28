import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, X } from "lucide-react";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.Order.list("-created_date", 100).then((d) => { setOrders(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const updateStatus = (id, status) => {
    base44.entities.Order.update(id, { status }).then(load);
  };

  if (viewing) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="display-text text-2xl text-white">{viewing.order_number}</h2>
            <p className="text-sm text-white/40 mt-1">{new Date(viewing.created_date).toLocaleString()}</p>
          </div>
          <button onClick={() => setViewing(null)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-5">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">Customer</h4>
            <p className="text-sm text-white">{viewing.customer_name}</p>
            <p className="text-sm text-white/60">{viewing.customer_email}</p>
            <p className="text-sm text-white/60">{viewing.customer_phone}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-5">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">Shipping</h4>
            <p className="text-sm text-white/60">{viewing.shipping_address}</p>
            <p className="text-sm text-white/60 mt-2">Payment: {viewing.payment_method}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 mb-6">
          <div className="px-5 py-4 border-b border-white/5"><h4 className="text-[11px] uppercase tracking-[0.2em] text-white/40">Items</h4></div>
          <div className="divide-y divide-white/5">
            {viewing.items?.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.image && <img src={item.image} alt="" className="w-10 h-10 object-cover" />}
                  <div><p className="text-sm text-white">{item.name}</p><p className="text-xs text-white/40">Qty: {item.quantity}</p></div>
                </div>
                <span className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-white/5 space-y-1 text-sm">
            <div className="flex justify-between text-white/60"><span>Subtotal</span><span>${(viewing.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-white/60"><span>Shipping</span><span>${(viewing.shipping || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-white font-bold text-base pt-2"><span>Total</span><span>${(viewing.total || 0).toFixed(2)}</span></div>
          </div>
        </div>
        <div>
          <label className="admin-label">Order Status</label>
          <select value={viewing.status} onChange={(e) => { updateStatus(viewing.id, e.target.value); setViewing({ ...viewing, status: e.target.value }); }} className="admin-input w-auto">
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mt-6">
          <label className="admin-label">Tracking Number</label>
          <div className="flex flex-wrap gap-3">
            <input value={viewing.tracking_number || ""} onChange={(e) => setViewing({ ...viewing, tracking_number: e.target.value })} placeholder="Carrier tracking number" className="admin-input flex-1 min-w-[200px]" />
            <input value={viewing.carrier || ""} onChange={(e) => setViewing({ ...viewing, carrier: e.target.value })} placeholder="Carrier (optional)" className="admin-input w-48" />
            <button onClick={() => base44.functions.invoke("updateOrderTracking", { order_id: viewing.id, tracking_number: viewing.tracking_number || "", carrier: viewing.carrier || "" }).then(() => alert("Tracking saved & logged to Google Sheets")).catch((e) => alert(e?.response?.data?.error || "Failed to save"))} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em]">Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="display-text text-2xl text-white">Orders</h2>
        <p className="text-sm text-white/40 mt-1">{orders.length} total orders</p>
      </div>
      <div className="bg-[#0a0a0a] border border-white/5 overflow-x-auto">
        {loading ? <div className="p-12 text-center text-white/30 text-sm">Loading…</div> : orders.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No orders yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {["Order", "Customer", "Date", "Items", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-sm font-medium text-white">{o.order_number}</td>
                  <td className="px-5 py-4 text-sm text-white/60">{o.customer_name}</td>
                  <td className="px-5 py-4 text-sm text-white/40">{new Date(o.created_date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm text-white/60">{o.items?.length || 0}</td>
                  <td className="px-5 py-4 text-sm font-bold text-white">${(o.total || 0).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none">
                      {statuses.map((s) => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4"><button onClick={() => setViewing(o)} className="p-1.5 text-white/50 hover:text-accent"><Eye className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}