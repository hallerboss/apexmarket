import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, Users, Eye, TrendingUp, Loader2, AlertCircle, Package, MousePointerClick } from "lucide-react";
import TrafficChart from "@/components/admin/TrafficChart";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "7 Days" },
  { key: "month", label: "30 Days" },
  { key: "year", label: "12 Months" },
];

const errText = (e, fallback) => e?.response?.data?.error || e?.message || fallback;

export default function AnalyticsOverview() {
  const [traffic, setTraffic] = useState(null);
  const [trafficError, setTrafficError] = useState(null);
  const [ga, setGa] = useState(null);
  const [gaError, setGaError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, g] = await Promise.allSettled([
        base44.functions.invoke("getTrafficStats", {}),
        base44.functions.invoke("getAnalyticsOverview", {}),
      ]);
      if (t.status === "fulfilled") setTraffic(t.value.data || t.value);
      else setTrafficError(errText(t.reason, "Unable to load traffic"));
      if (g.status === "fulfilled") setGa(g.value.data || g.value);
      else setGaError(errText(g.reason, "Unable to load analytics"));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-6 py-4 border-b border-[#eef0f2] flex items-center gap-2">
        <MousePointerClick className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-black">Traffic</h3>
        <span className="text-[10px] text-black/40">Live visitor counts from your store</span>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : (
        <div className="p-5 space-y-6">
          {trafficError ? (
            <div className="flex items-start gap-2 text-sm text-black/60">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-black">Visitor counts not available</p>
                <p className="text-xs text-black/50 mt-1">{trafficError}</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-2">Visitors by Period</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RANGES.map((r) => (
                    <div key={r.key} className="border border-[#eef0f2] p-3">
                      <p className="text-xl font-bold text-black">{Number(traffic?.visitorsByRange?.[r.key] ?? 0).toLocaleString()}</p>
                      <p className="text-[10px] uppercase tracking-wide text-black/50">{r.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-2">Product Visitors by Period</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RANGES.map((r) => (
                    <div key={r.key} className="border border-[#eef0f2] p-3">
                      <p className="text-xl font-bold text-black">{Number(traffic?.productViewsByRange?.[r.key] ?? 0).toLocaleString()}</p>
                      <p className="text-[10px] uppercase tracking-wide text-black/50">{r.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#eef0f2] pt-5 space-y-6">
                <TrafficChart title="Visitors Over Time" series={traffic?.visitorsSeries} color="#2563eb" />
                <TrafficChart title="Product Visitors Over Time" series={traffic?.productVisitorsSeries} color="#f9ab00" />
              </div>
            </>
          )}

          <div className="border-t border-[#eef0f2] pt-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#f9ab00]" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50">Google Analytics — last 30 days</p>
            </div>
            {gaError ? (
              <div className="flex items-start gap-2 text-sm text-black/60">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-black">Analytics not available</p>
                  <p className="text-xs text-black/50 mt-1">{gaError}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Stat icon={Users} label="Visitors" value={ga?.visitors ?? 0} />
                  <Stat icon={Eye} label="Sessions" value={ga?.sessions ?? 0} />
                  <Stat icon={TrendingUp} label="Page Views" value={ga?.pageViews ?? 0} />
                </div>
                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-2">Top Products by Interest</p>
                  {ga?.topProducts?.length ? (
                    <div className="space-y-2">
                      {ga.topProducts.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[11px] text-black/40 w-4">{i + 1}</span>
                          <Package className="w-3.5 h-3.5 text-black/30 shrink-0" />
                          <span className="text-sm text-black truncate flex-1">{p.name}</span>
                          <span className="text-xs font-semibold text-black/70">{p.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-black/40">No product views recorded yet.</p>
                  )}
                </div>
              </>
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