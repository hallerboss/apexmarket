import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User as UserIcon, Mail, Camera, Package } from "lucide-react";

const statusColor = (s) => ({
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}[s] || "bg-muted text-muted-foreground");

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { setUser(null); return; }
        setUser(me);
        setName(me.full_name || "");
        setPhoto(me.photo || "");
        const list = await base44.entities.Order.filter({ customer_email: me.email }, "-created_date", 50).catch(() => []);
        setOrders(list);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveName = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name });
      setUser({ ...user, full_name: name });
    } catch (e) {
      alert(e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ photo: file_url });
      setPhoto(file_url);
      setUser({ ...user, photo: file_url });
    } catch (err) {
      alert(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="container-bleed px-5 py-32 text-center"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>;
  }
  if (!user) {
    return (
      <div className="container-bleed px-5 py-24 lg:py-32 text-center">
        <h1 className="display-text text-4xl mb-4">Your Profile</h1>
        <p className="serif-text text-lg text-muted-foreground mb-8">Please sign in to view your account and orders.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="btn-mono-solid">Sign In</Link>
          <Link to="/register" className="btn-mono-outline">Create Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-bleed px-5 lg:px-10 py-12 lg:py-16">
      <h1 className="display-text text-4xl lg:text-5xl mb-10">My Profile</h1>
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
        {/* Account card */}
        <div className="lg:col-span-1">
          <div className="border hairline p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {photo ? (
                <img src={photo} alt={user.full_name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-foreground text-background w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent">
                {uploading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
              </label>
            </div>
            <p className="text-lg font-semibold">{user.full_name || "No name set"}</p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{user.email}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-3">{user.role}</p>
            {user.role === "admin" && <Link to="/admin" className="btn-mono-outline mt-5 w-full">Admin Panel</Link>}
          </div>

          <div className="border hairline p-6 mt-6">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Edit Details</h3>
            <label className="block text-xs text-muted-foreground mb-1">Username / Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border hairline px-3 py-2.5 text-sm bg-transparent focus:border-accent outline-none mb-4" />
            <button onClick={saveName} disabled={saving} className="btn-mono-solid w-full disabled:opacity-50">{saving ? "Saving…" : "Save Name"}</button>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">To change your password, use the <Link to="/forgot-password" className="text-accent underline">forgot password</Link> flow — a reset link is emailed to you.</p>
          </div>
        </div>

        {/* Order history */}
        <div className="lg:col-span-2">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-6 flex items-center gap-2"><Package className="w-4 h-4" /> Previous Orders ({orders.length})</h3>
          {orders.length === 0 ? (
            <div className="border hairline p-10 text-center">
              <p className="serif-text text-muted-foreground mb-4">You have no orders yet.</p>
              <Link to="/shop" className="btn-mono-solid">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border hairline p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold">{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleDateString()} · {o.items?.length || 0} item(s)</p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${(o.total || 0).toFixed(2)}</span>
                    <Link to={`/track?order=${o.order_number}`} className="text-sm text-accent hover:underline">Track →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}