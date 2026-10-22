import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, AlertCircle, MousePointerClick, Eye, Percent, TrendingUp, RefreshCw } from "lucide-react";

const errText = (e) => e?.response?.data?.error || e?.message || "Unable to load Search Console data";
const pct = (n) => `${((n || 0) * 100).toFixed(1)}%`;

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="border border-[#eef0f2] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-[11px] uppercase tracking-[0.15em] text-black/50">{label}</span>
      </div>
      <p className="text-xl font-bold text-black">{value}</p>
    </div>
  );
}

function RowList({ title, rows, empty }) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-[0.15em] text-black/50 mb-3">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-sm text-black/40">{empty}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-black/80">{r.label}</span>
              <span className="shrink-0 text-black/50 text-xs">
                {r.clicks} clicks · {r.impressions} impr · pos {r.position.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchConsolePanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (site) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getSearchConsoleStats", site ? { site } : {});
      setData(res.data || res);
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-6 py-4 border-b border-[#eef0f2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-black">Search Performance</h3>
          {data?.range && (
            <span className="text-[11px] text-black/40 hidden sm:inline">
              {data.range.startDate} → {data.range.endDate}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {data?.sites?.length > 1 && (
            <select
              value={data.site}
              onChange={(e) => load(e.target.value)}
              className="text-xs border border-[#e5e7eb] px-2 py-1.5 bg-white text-black max-w-[220px]"
            >
              {data.sites.map((s) => <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}
            </select>
          )}
          <button onClick={() => load(data?.site)} className="text-black/40 hover:text-black" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && !data ? (
          <div className="flex items-center justify-center gap-2 py-10 text-black/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading search data…
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 py-6 text-sm text-black/60">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        ) : !data?.site ? (
          <p className="py-6 text-sm text-black/50">
            No Search Console properties found for the connected Google account. Connect an account that has a verified site in Google Search Console.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="Clicks" value={data.totals.clicks.toLocaleString()} icon={MousePointerClick} />
              <Metric label="Impressions" value={data.totals.impressions.toLocaleString()} icon={Eye} />
              <Metric label="Avg CTR" value={pct(data.totals.ctr)} icon={Percent} />
              <Metric label="Avg Position" value={(data.totals.position || 0).toFixed(1)} icon={TrendingUp} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <RowList title="Top Queries" rows={data.topQueries} empty="No query data for this period." />
              <RowList title="Top Pages" rows={data.topPages} empty="No page data for this period." />
            </div>
            <p className="text-[11px] text-black/40">{data.site}</p>
          </div>
        )}
      </div>
    </div>
  );
}