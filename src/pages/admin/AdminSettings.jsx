import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, ShoppingBag, DollarSign, CheckCircle2, Link2, Loader2, RefreshCw, ExternalLink } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    store_name: "Wolmart",
    store_email: "hello@wolmart.studio",
    store_phone: "+1 (555) 028-2024",
    currency: "USD",
    free_shipping_threshold: "50",
    tax_rate: "8",
  });
  const [saved, setSaved] = useState(false);
  const [siteSettings, setSiteSettings] = useState([]);
  const [merchantId, setMerchantId] = useState("");
  const [adsenseId, setAdsenseId] = useState("");
  const [connecting, setConnecting] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    base44.entities.SiteSetting.list().then((data) => {
      setSiteSettings(data);
      const m = data.find((s) => s.key === "google_merchant_id");
      const a = data.find((s) => s.key === "adsense_publisher_id");
      if (m) setMerchantId(m.value);
      if (a) setAdsenseId(a.value);
    }).catch(() => {});
  }, []);

  const getSetting = (key) => siteSettings.find((s) => s.key === key)?.value || "";
  const isMerchantConnected = !!getSetting("google_merchant_id");
  const isAdsenseConnected = !!getSetting("adsense_publisher_id");
  const lastSync = getSetting("merchant_last_sync");
  const feedUrl = "https://apexmarket-app.base44.app/functions/syncGoogleMerchant";

  const saveSetting = async (key, value) => {
    const existing = siteSettings.find((s) => s.key === key);
    if (existing) {
      await base44.entities.SiteSetting.update(existing.id, { value });
    } else {
      await base44.entities.SiteSetting.create({ key, value });
    }
    const refreshed = await base44.entities.SiteSetting.list();
    setSiteSettings(refreshed);
  };

  const save = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const connectMerchant = async () => {
    if (!merchantId.trim()) return;
    setConnecting("merchant");
    try { await saveSetting("google_merchant_id", merchantId.trim()); } finally { setConnecting(null); }
  };

  const connectAdsense = async () => {
    if (!adsenseId.trim()) return;
    setConnecting("adsense");
    try { await saveSetting("adsense_publisher_id", adsenseId.trim()); } finally { setConnecting(null); }
  };

  const syncMerchant = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke("syncGoogleMerchant", {});
      setSyncResult(res.data);
      const refreshed = await base44.entities.SiteSetting.list();
      setSiteSettings(refreshed);
    } catch (err) {
      setSyncResult({ error: err?.response?.data?.error || err?.message || "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async (key) => {
    await saveSetting(key, "");
    if (key === "google_merchant_id") setMerchantId("");
    if (key === "adsense_publisher_id") setAdsenseId("");
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="display-text text-2xl text-white">Settings</h2>
        <p className="text-sm text-black/50 mt-1">Store configuration & account connections</p>
      </div>

      <form onSubmit={save} className="space-y-5">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white border-b border-white/10 pb-3">Store Details</h3>
        <div><label className="admin-label">Store Name</label><input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className="admin-input" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="admin-label">Contact Email</label><input value={settings.store_email} onChange={(e) => setSettings({ ...settings, store_email: e.target.value })} className="admin-input" /></div>
          <div><label className="admin-label">Contact Phone</label><input value={settings.store_phone} onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })} className="admin-input" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="admin-label">Currency</label><select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="admin-input"><option>USD</option><option>EUR</option><option>GBP</option><option>PKR</option></select></div>
          <div><label className="admin-label">Free Shipping Over ($)</label><input value={settings.free_shipping_threshold} onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })} className="admin-input" /></div>
          <div><label className="admin-label">Tax Rate (%)</label><input value={settings.tax_rate} onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })} className="admin-input" /></div>
        </div>
        <button type="submit" className="bg-accent text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Settings"}
        </button>
      </form>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white border-b border-white/10 pb-3 mb-6">Account Connections</h3>
        <div className="space-y-4">
          <div className="border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4285F4]/10 flex items-center justify-center rounded">
                <ShoppingBag className="w-5 h-5 text-[#4285F4]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Google Merchant Center</p>
                <p className="text-xs text-black/50">List products on Google Shopping</p>
              </div>
              {isMerchantConnected && <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Connected</span>}
            </div>
            <div className="flex gap-2">
              <input placeholder="Merchant Center ID (e.g. 123456789)" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} className="admin-input flex-1" />
              {isMerchantConnected ? (
                <button type="button" onClick={() => disconnect("google_merchant_id")} className="border border-red-300 text-black px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-red-50 whitespace-nowrap">Disconnect</button>
              ) : (
                <button type="button" onClick={connectMerchant} disabled={connecting === "merchant" || !merchantId.trim()} className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                  {connecting === "merchant" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Connect
                </button>
              )}
            </div>
          </div>

          <div className="border border-[#e5e7eb] bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ea4335]/10 flex items-center justify-center rounded">
                <DollarSign className="w-5 h-5 text-[#ea4335]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Google AdSense</p>
                <p className="text-xs text-black/50">Monetize blog posts with display ads</p>
              </div>
              {isAdsenseConnected && <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Connected</span>}
            </div>
            <div className="flex gap-2">
              <input placeholder="Publisher ID (ca-pub-XXXXXXXXX)" value={adsenseId} onChange={(e) => setAdsenseId(e.target.value)} className="admin-input flex-1" />
              {isAdsenseConnected ? (
                <button type="button" onClick={() => disconnect("adsense_publisher_id")} className="border border-red-300 text-black px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-red-50 whitespace-nowrap">Disconnect</button>
              ) : (
                <button type="button" onClick={connectAdsense} disabled={connecting === "adsense" || !adsenseId.trim()} className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                  {connecting === "adsense" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Connect
                </button>
              )}
            </div>
            {isAdsenseConnected && <p className="text-[11px] text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ads are now displaying on your blog posts and store pages.</p>}
          </div>
        </div>
      </div>

      {/* Google Merchant Center — Catalog Sync */}
      {isMerchantConnected && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white border-b border-white/10 pb-3 mb-6">Google Merchant — Catalog Sync</h3>
          <div className="border border-[#e5e7eb] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Product Feed Status</p>
                <p className="text-xs text-black/50 mt-0.5">
                  {lastSync ? `Last synced: ${new Date(lastSync).toLocaleString()}` : "Not synced yet — click Sync Now to generate your feed."}
                </p>
              </div>
              {lastSync && <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>}
            </div>

            <div>
              <label className="admin-label">Feed URL — register this in Google Merchant Center</label>
              <div className="flex gap-2">
                <input readOnly value={feedUrl} className="admin-input font-mono text-xs flex-1" />
                <button type="button" onClick={() => navigator.clipboard?.writeText(feedUrl)} className="border border-[#e5e7eb] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#fafafa] whitespace-nowrap">Copy</button>
              </div>
              <p className="text-[11px] text-black/40 mt-1">In Merchant Center: Products → Feeds → Add primary feed → Scheduled fetch → paste this URL. Google will fetch your product catalog automatically.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={syncMerchant} disabled={syncing} className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} {syncing ? "Syncing…" : "Sync Now"}
              </button>
              <a href="https://merchants.google.com/mc/feeds" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Open Merchant Center
              </a>
            </div>

            {syncResult?.error && <p className="text-xs text-red-600">{syncResult.error}</p>}
            {syncResult?.success && (
              <div className="border border-green-300 bg-green-50 p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">{syncResult.synced} products synced to Google Shopping feed. Register the Feed URL above in Merchant Center to go live.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}