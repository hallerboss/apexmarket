import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Webhook, ShieldCheck } from "lucide-react";

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Order.list("-created_date", 20).then(setOrders).finally(() => setLoading(false));
  }, []);

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="display-text text-2xl">Payments</h2>
        <p className="text-sm text-black/50 mt-1">Stripe integration status & recent transactions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">Mode</span></div>
          <p className="text-lg font-bold">Test Mode (Sandbox)</p>
          <p className="text-xs text-black/50 mt-1">Use card <span className="font-mono">4242 4242 4242 4242</span> for testing.</p>
        </div>
        <div className="border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-accent" /><span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">Collected</span></div>
          <p className="text-lg font-bold">${revenue.toFixed(2)}</p>
          <p className="text-xs text-black/50 mt-1">{orders.length} recent orders</p>
        </div>
        <div className="border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><Webhook className="w-4 h-4 text-accent" /><span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">Webhook</span></div>
          <p className="text-[11px] font-mono break-all text-black/60">/functions/stripeWebhook</p>
          <p className="text-xs text-black/50 mt-1">Signing secret configured.</p>
        </div>
      </div>

      <div className="border border-[#e5e7eb] bg-amber-50 border-l-4 border-l-amber-400 p-4 mb-8 text-sm text-black/70">
        <p className="font-semibold mb-1">Go live with real payments</p>
        <p>Go to <span className="font-medium">Dashboard → Integrations</span>, click your Stripe integration, and provide your live Stripe API keys to accept real payments.</p>
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-[0.15em] mb-3">Recent Transactions</h3>
      <div className="bg-white border border-[#e5e7eb] overflow-x-auto">
        {loading ? <div className="p-10 text-center text-black/40 text-sm">Loading…</div> : orders.length === 0 ? (
          <div className="p-10 text-center text-black/40 text-sm">No transactions yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-left">
                {["Order", "Customer", "Date", "Total", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-black/50 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f2]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#fafafa]">
                  <td className="px-5 py-3 text-sm font-medium">{o.order_number}</td>
                  <td className="px-5 py-3 text-sm text-black/60">{o.customer_name}</td>
                  <td className="px-5 py-3 text-sm text-black/50">{new Date(o.created_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm font-bold">${(o.total || 0).toFixed(2)}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] uppercase tracking-wide px-2 py-1 ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}