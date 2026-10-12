import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, Loader2, Search, Package, ChevronDown, Wand2 } from "lucide-react";
import { TRACKING_STAGES, stageIndex, stageLabel } from "@/lib/orderTracking";

export default function AdminTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    base44.entities.Order.list("-created_date", 200).then((d) => { setOrders(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const autoAssign = async () => {
    setAssigning(true);
    try {
      const res = await base44.functions.invoke("autoAssignTracking", {});
      alert(`${res.data.assigned} tracking number(s) assigned — customers emailed.`);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (o.order_number || "").toLowerCase().includes(q) ||
      (o.tracking_number || "").toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q);
  });
  const missing = orders.filter((o) => !o.tracking_number).length;
  const [updatingStage, setUpdatingStage] = useState(null);

  const setStage = async (orderId, stage) => {
    setUpdatingStage(stage);
    try {
      const res = await base44.functions.invoke("updateOrderTracking", { order_id: orderId, tracking_status: stage, note: "" });
      setOrders((list) => list.map((o) => (o.id === orderId ? { ...o, ...res.data.order } : o)));
      alert(`Status updated to "${stageLabel(stage)}" — the customer has been emailed.`);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStage(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="display-text text-2xl">Tracking</h2>
          <p className="text-sm text-black/50 mt-1">{orders.length} orders · {missing} without a tracking number</p>
        </div>
        <button onClick={autoAssign} disabled={assigning || missing === 0} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] flex items-center gap-2 disabled:opacity-50">
          {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Auto-Assign{missing > 0 ? ` (${missing})` : ""}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
        <input placeholder="Search by order #, tracking # or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-11" />
      </div>

      <div className="bg-white border border-[#e5e7eb]">
        {loading ? (
          <div className="p-12 text-center text-black/40 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-black/40 text-sm">No orders found.</div>
        ) : (
          <div className="divide-y divide-[#eef0f2]">
            {filtered.map((o) => {
              const open = expanded === o.id;
              const reached = stageIndex(o.tracking_status);
              const history = o.tracking_history || [];
              return (
                <div key={o.id}>
                  <div className="px-5 py-4 flex items-center gap-4 hover:bg-[#fafafa] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{o.order_number}</p>
                      <p className="text-xs text-black/50">{o.customer_name} · {new Date(o.created_date).toLocaleDateString()}</p>
                    </div>
                    {o.tracking_number ? (
                      <button onClick={() => setExpanded(open ? null : o.id)} className="flex items-center gap-2 text-sm text-accent font-medium shrink-0">
                        <Truck className="w-4 h-4" /> <span className="hidden sm:inline">{o.tracking_number}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <span className="text-xs text-black/40 flex items-center gap-1 shrink-0"><Package className="w-4 h-4" /> No tracking</span>
                    )}
                    <span className="text-[10px] uppercase tracking-wide bg-black/5 text-black/60 px-2 py-1 shrink-0 hidden sm:inline">{stageLabel(o.tracking_status)}</span>
                  </div>
                  {open && o.tracking_number && (
                    <div className="px-5 pb-5 bg-[#fafafa] border-t border-[#eef0f2]">
                      <p className="text-[11px] uppercase tracking-[0.15em] text-black/50 mb-3 mt-3">Tracking Status — {o.tracking_number}</p>
                      <div className="relative pl-6">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#e0e0e0]" />
                        {TRACKING_STAGES.map((s, i) => {
                          const done = i <= reached;
                          const entry = history.filter((h) => h.status === s.key).pop();
                          const isUpdating = updatingStage === s.key;
                          const clickable = i > reached;
                          return (
                            <button
                              key={s.key}
                              type="button"
                              disabled={!clickable || isUpdating}
                              onClick={() => clickable && setStage(o.id, s.key)}
                              className={`relative mb-4 last:mb-0 text-left block w-full ${clickable ? "cursor-pointer" : "cursor-default"} disabled:opacity-60`}
                            >
                              <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center ${done ? "bg-[#16a34a]" : clickable ? "bg-white border-[#16a34a]" : "bg-[#d8d8d8]"}`} />
                              <p className={`text-sm ${done ? "font-semibold text-black" : "text-black/40"}`}>{s.label}</p>
                              {entry && <p className="text-xs text-black/40">{new Date(entry.timestamp).toLocaleString()}</p>}
                              {entry?.note && <p className="text-xs text-black/50 mt-0.5">{entry.note}</p>}
                              {clickable && !isUpdating && <p className="text-[10px] text-accent mt-0.5">Click to set & notify customer</p>}
                              {isUpdating && <p className="text-[10px] text-accent mt-0.5">Updating…</p>}
                            </button>
                          );
                        })}
                      </div>
                      {history.length === 0 && (
                        <p className="text-xs text-black/40 mt-2">No status updates yet — set stages from the Orders page.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}