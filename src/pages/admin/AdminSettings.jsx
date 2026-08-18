import { useState } from "react";
import { Save } from "lucide-react";

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

  const save = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="display-text text-2xl text-white">Settings</h2>
        <p className="text-sm text-white/40 mt-1">Store configuration</p>
      </div>
      <form onSubmit={save} className="space-y-5">
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
    </div>
  );
}