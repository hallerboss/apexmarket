import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X, Star } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    setLoading(true);
    base44.entities.Review.list("-created_date", 100).then((d) => { setReviews(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const setStatus = (id, status) => {
    base44.entities.Review.update(id, { status }).then((r) => {
      base44.functions.invoke("recomputeProductRating", { product_id: r.product_id }).catch(() => {});
      load();
    });
  };

  const filtered = reviews.filter((r) => filter === "all" || r.status === filter);

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="display-text text-2xl text-white">Reviews</h2>
        <p className="text-sm text-white/40 mt-1">Moderate customer feedback</p>
      </div>

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
              filter === f ? "bg-white text-black" : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            {f} {f !== "all" && `(${counts[f] || 0})`}
          </button>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-white/5">
        {loading ? <div className="p-12 text-center text-white/30 text-sm">Loading…</div> : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No reviews.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((r) => (
              <div key={r.id} className="px-5 py-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />)}</div>
                      <span className="text-sm font-semibold text-white">{r.author}</span>
                      <span className={`text-[9px] uppercase tracking-wide px-2 py-0.5 ${
                        r.status === "approved" ? "bg-green-500/10 text-green-400" :
                        r.status === "rejected" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-white/40">{r.product_name} · {r.email}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setStatus(r.id, "approved")} className="p-2 text-white/50 hover:text-green-400" title="Approve"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setStatus(r.id, "rejected")} className="p-2 text-white/50 hover:text-red-400" title="Reject"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                {r.title && <p className="text-sm font-medium text-white mb-1">{r.title}</p>}
                <p className="text-sm text-white/60 serif-text">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}