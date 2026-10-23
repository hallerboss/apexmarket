import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Store, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

const FEED_URL = "https://usa-wishlist.base44.app/functions/syncGoogleMerchant";

function Metric({ label, value, hint }) {
  return (
    <div className="border border-[#eef0f2] p-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-black/50 mb-2">{label}</p>
      <p className="text-xl font-bold text-black">{value}</p>
      {hint && <p className="text-[11px] text-black/40 mt-1">{hint}</p>}
    </div>
  );
}

export default function GoogleMerchantStatus() {
  const [state, setState] = useState({ loading: true, lastSync: null, listed: 0, total: 0, error: null });
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    try {
      const [settings, products] = await Promise.all([
        base44.entities.SiteSetting.list(),
        base44.entities.Product.list("-created_date", 500),
      ]);
      const published = (products || []).filter((p) => p.status === "published");
      setState({
        loading: false,
        lastSync: (settings || []).find((s) => s.key === "merchant_last_sync")?.value || null,
        listed: published.filter((p) => p.google_shopping !== false).length,
        total: published.length,
        error: null,
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || "Unable to load sync status" }));
    }
  };

  useEffect(() => { load(); }, []);

  const syncNow = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke("syncGoogleMerchant", {});
      await load();
    } catch (e) {
      setState((s) => ({ ...s, error: e?.response?.data?.error || e?.message || "Sync failed" }));
    } finally {
      setSyncing(false);
    }
  };

  const synced = !!state.lastSync;

  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-6 py-4 border-b border-[#eef0f2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-black">Google Merchant Center</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="text-black/40 hover:text-black" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={syncNow}
            disabled={syncing}
            className="bg-[#f9ab00] text-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-[#e39c00] disabled:opacity-60 flex items-center gap-2"
          >
            {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</> : "Sync Now"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {state.loading && !state.lastSync && state.total === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-black/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading sync status…
          </div>
        ) : state.error ? (
          <div className="flex items-start gap-2 py-6 text-sm text-black/60">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p>{state.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="Status" value={synced ? "Synced" : "Not synced"} hint={synced ? "Feed is live" : "Run a sync to publish"} />
              <Metric label="Products Listed" value={`${state.listed} / ${state.total}`} hint="Published products in the feed" />
              <Metric
                label="Last Sync"
                value={state.lastSync ? new Date(state.lastSync).toLocaleDateString() : "—"}
                hint={state.lastSync ? new Date(state.lastSync).toLocaleTimeString() : "Never"}
              />
              <Metric label="Excluded" value={state.total - state.listed} hint="Turned off for Google Shopping" />
            </div>
            {synced ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Feed URL: <span className="text-black/60 text-xs break-all">{FEED_URL}</span>
              </div>
            ) : (
              <p className="text-sm text-black/50">
                No sync yet. Click “Sync Now” to publish your products, then add the feed URL in Google Merchant Center.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}