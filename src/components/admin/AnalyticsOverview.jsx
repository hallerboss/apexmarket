import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, Users, Eye, TrendingUp, Loader2, AlertCircle } from "lucide-react";

export default function AnalyticsOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getAnalyticsOverview", {});
      setData(res.data || res);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-6 py-4 border-b border-[#eef0f2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#f9ab00]" />
          <h3 className="text-sm font-semibold text-black">Google Analytics</h3>
          <span className="text-[10px] text-black/40">Last 30 days</span>
        </div>
        {data?.property && (
          <span className="text-[10px] text-black/40 truncate max-w-[180px]">{data.property}</span>
        )}
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="p-6 flex items-start gap-2 text-sm text-black/60">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-black">Analytics not available</p>
            <p className="text-xs text-black/50 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={Users} label="Visitors" value={data?.visitors ?? 0} />
            <Stat icon={Eye} label="Sessions" value={data?.sessions ?? 0} />
            <Stat icon={TrendingUp} label="Page Views" value={data?.pageViews ?? 0} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-2">
              Top Products by Interest
            </p>
            {data?.topProducts?.length ? (
              <div className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] text-black/40 w-4">{i + 1}</span>
                    <span className="text-sm text-black truncate flex-1">{p.name}</span>
                    <span className="text-xs font-semibold text-black/70">{p.views} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-black/40">No product views recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="border border-[#eef0f2] p-3">
      <Icon className="w-4 h-4 text-black/40 mb-2" />
      <p className="text-xl font-bold text-black">{Number(value || 0).toLocaleString()}</p>
      <p className="text-[10px] uppercase tracking-wide text-black/50">{label}</p>
    </div>
  );
}