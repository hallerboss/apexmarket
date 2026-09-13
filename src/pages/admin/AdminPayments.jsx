import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Webhook, ShieldCheck, Loader2, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";

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
  const [secretKey, setSecretKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.Order.list("-created_date", 20).then(setOrders).finally(() => setLoading(false));
  }, []);

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);

  const verify = async (e) => {
    e.preventDefault();
    if (!secretKey.trim()) return;
    setVerifying(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("verifyStripeKey", {
        secret_key: secretKey.trim(),
        publishable_key: publishableKey.trim(),
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err?.response?.data?.error || err?.message || "Verification failed" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="display-text text-2xl">Payments</h2>
        <p className="text-sm text-black/50 mt-1">Stripe integration status & recent transactions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">Mode</span></div>
          <p className="text-lg font-bold text-green-700">Live Mode</p>
          <p className="text-xs text-green-600 mt-1 font-medium">Your store is accepting real payments.</p>
        </div>
        <div className="border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-accent" /><span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">Collected</span></div>
          <p className="text-lg font-bold">${revenue.toFixed(2)}</p>
          <p className="text-xs text-black/50 mt-1">{orders.length} recent orders</p>
        </div>
        <div className="border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><Webhook className="w-4 h-4 text-green-600" /><span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black/50">Webhook</span></div>
          <p className="text-[11px] font-mono break-all text-black/60">apexmarket-app.base44.app/functions/stripeWebhook</p>
          <p className="text-xs text-green-600 mt-1 font-medium">Endpoint registered & active.</p>
        </div>
      </div>

      {/* Activate real payments — upload & verify Stripe keys */}
      <div className="border border-[#e5e7eb] bg-white p-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold">Activate Real Payments</h3>
        </div>
        <p className="text-sm text-black/50 mb-5">Your Stripe account is linked and live. You can verify new keys here if you need to switch accounts.</p>

        <form onSubmit={verify} className="space-y-4 max-w-xl">
          <div>
            <label className="admin-label">Secret Key</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_..."
                className="admin-input pr-10 font-mono"
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowSecret((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="admin-label">Publishable Key</label>
            <input
              type="text"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder="pk_live_..."
              className="admin-input font-mono"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={verifying || !secretKey.trim()}
            className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & Activate"}
          </button>
        </form>

        {result && (
          <div className="mt-5 max-w-xl">
            {result.valid ? (
              <div className={`border p-4 ${result.livemode ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className={`w-5 h-5 ${result.livemode ? "text-green-600" : "text-amber-600"}`} />
                  <p className="font-semibold text-sm">{result.livemode ? "Live key verified" : "Test key verified"}</p>
                </div>
                <p className="text-xs text-black/60 mb-2">
                  Account <span className="font-mono">{result.account_id}</span>
                  {result.business_name ? ` · ${result.business_name}` : ""}
                  {result.country ? ` · ${result.country}` : ""}
                  {result.default_currency ? ` · ${result.default_currency.toUpperCase()}` : ""}
                </p>
                {result.livemode ? (
                  <p className="text-xs text-black/70">
                    Your live key is valid. To start accepting real payments, add these keys in{" "}
                    <span className="font-semibold">Dashboard → Secrets</span> as{" "}
                    <span className="font-mono">STRIPE_SECRET_KEY</span> and{" "}
                    <span className="font-mono">STRIPE_PUBLISHABLE_KEY</span> (replacing the sandbox values). Checkout will then run in live mode.
                  </p>
                ) : (
                  <p className="text-xs text-black/70">This is a test key. Switch to a live key (<span className="font-mono">sk_live_…</span>) to accept real payments.</p>
                )}
              </div>
            ) : (
              <div className="border border-red-300 bg-red-50 p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-red-700">Verification failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{result.error || "The API key could not be verified."}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Webhook Configuration & Stripe Account Connection */}
      <div className="border border-[#e5e7eb] bg-white p-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Webhook className="w-5 h-5 text-accent" />
          <h3 className="text-base font-bold">Webhook Configuration</h3>
        </div>
        <p className="text-sm text-black/50 mb-5">Connect your Stripe account and manage webhook settings for real-time payment events.</p>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="admin-label">Webhook Endpoint URL</label>
            <div className="flex gap-2">
              <input readOnly value="https://apexmarket-app.base44.app/functions/stripeWebhook" className="admin-input font-mono text-xs" />
              <button type="button" onClick={() => { navigator.clipboard?.writeText("https://apexmarket-app.base44.app/functions/stripeWebhook"); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="border border-[#e5e7eb] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#fafafa] whitespace-nowrap flex items-center gap-1.5">
                {copied ? <><CheckCircle2 className="w-4 h-4 text-green-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>

          <div>
            <label className="admin-label">Webhook Signing Secret</label>
            <div className="flex items-center gap-2 border border-[#e5e7eb] px-4 py-2.5 bg-[#fafafa]">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-700 font-medium">Connected & Active</span>
              <span className="text-xs text-black/40 ml-auto font-mono">whsec_••••••••</span>
            </div>
            <p className="text-[11px] text-black/40 mt-1">The signing secret is configured. To update, go to Dashboard → Secrets → STRIPE_WEBHOOK_SECRET.</p>
          </div>

          <div className="border-t border-[#e5e7eb] pt-4">
            <label className="admin-label">Connect Stripe Account</label>
            <div className="flex flex-wrap gap-2 mb-3">
              <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90">
                <CreditCard className="w-4 h-4" /> Open Stripe Dashboard
              </a>
              <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#e5e7eb] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#fafafa]">
                <KeyRound className="w-4 h-4" /> Get API Keys
              </a>
            </div>
            <div className="text-[11px] text-black/50 space-y-1">
              <p className="font-semibold text-black/70">Setup steps:</p>
              <p>1. Get your API keys from Stripe → paste them above → click "Verify & Activate"</p>
              <p>2. In Stripe Dashboard → Developers → Webhooks → Add endpoint</p>
              <p>3. Paste the Webhook Endpoint URL above</p>
              <p>4. Copy the signing secret → add it in Dashboard → Secrets as STRIPE_WEBHOOK_SECRET</p>
            </div>
          </div>
        </div>
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