import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Store, Check, Copy, X } from "lucide-react";

export default function GoogleMerchantSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const sync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("syncGoogleMerchant", {});
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const copyFeed = () => {
    navigator.clipboard.writeText(result.feed_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        onClick={sync}
        disabled={syncing}
        className="bg-[#f9ab00] text-black px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#e39c00] flex items-center gap-2 disabled:opacity-60"
      >
        {syncing ? (
          <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Syncing…</>
        ) : (
          <><Store className="w-4 h-4" /> Sync to Google Merchant</>
        )}
      </button>

      {error && (
        <div className="mt-3 border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {result && (
        <div className="mt-3 border border-[#e5e7eb] bg-white p-4 max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <Check className="w-4 h-4" /> {result.synced} products listed for Google Merchant Center
            </div>
            <button onClick={() => setResult(null)} className="text-black/40 hover:text-black"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-xs text-black/50 mt-2">Last sync: {new Date(result.last_sync).toLocaleString()}</p>
          <p className="text-[11px] text-black/50 mt-3">Add this feed URL in Google Merchant Center → Products → Feeds → Scheduled fetch:</p>
          <div className="flex items-center gap-2 mt-2">
            <input readOnly value={result.feed_url} className="admin-input flex-1 text-xs" />
            <button onClick={copyFeed} className="border border-[#e5e7eb] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#fafafa] flex items-center gap-1.5 whitespace-nowrap">
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}