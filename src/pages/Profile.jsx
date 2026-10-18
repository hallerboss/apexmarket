import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/lib/cartContext";
import { User as UserIcon, Mail, Camera, Package, ShoppingCart, Star, Heart } from "lucide-react";
import ProfileOrders from "@/components/profile/ProfileOrders";
import ProfileCart from "@/components/profile/ProfileCart";
import ProfileReviews from "@/components/profile/ProfileReviews";
import ProfileSavedItems from "@/components/profile/ProfileSavedItems";

const asList = (p) => (Array.isArray(p) ? p : p?.items || []);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState("orders");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { count: cartCount } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { setUser(null); return; }
        setUser(me);
        setName(me.full_name || "");
        setPhoto(me.photo || "");
        const [ord, rev] = await Promise.all([
          base44.entities.Order
            .filter({ customer_email: me.email }, { sort: "-created_date", limit: 50 })
            .then(asList).catch(() => []),
          base44.entities.Review
            .filter({ email: me.email }, { sort: "-created_date", limit: 50 })
            .then(asList).catch(() => []),
        ]);
        setOrders(ord);
        setReviews(rev);
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

  const tabs = [
    { id: "orders", label: "Orders", icon: Package, count: orders.length },
    { id: "cart", label: "Cart", icon: ShoppingCart, count: cartCount },
    { id: "reviews", label: "Reviews", icon: Star, count: reviews.length },
    { id: "saved", label: "Saved Items", icon: Heart },
  ];

  return (
    <div className="container-bleed px-4 sm:px-5 lg:px-10 py-8 sm:py-12 lg:py-16">
      <h1 className="display-text text-3xl sm:text-4xl lg:text-5xl mb-6 sm:mb-10">My Profile</h1>
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-14">
        {/* Account card */}
        <div className="lg:col-span-1">
          <div className="border hairline p-5 sm:p-6 text-center">
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

          <div className="border hairline p-5 sm:p-6 mt-6">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Edit Details</h3>
            <label className="block text-xs text-muted-foreground mb-1">Username / Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border hairline px-3 py-2.5 text-base sm:text-sm bg-transparent focus:border-accent outline-none mb-4" />
            <button onClick={saveName} disabled={saving} className="btn-mono-solid w-full disabled:opacity-50">{saving ? "Saving…" : "Save Name"}</button>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">To change your password, use the <Link to="/forgot-password" className="text-accent underline">forgot password</Link> flow — a reset link is emailed to you.</p>
          </div>
        </div>

        {/* Account activity */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-1 sm:overflow-x-auto sm:border-b sm:border-[#e5e7eb] mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] uppercase tracking-[0.12em] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-3.5 h-3.5 shrink-0" />
                {t.label}{typeof t.count === "number" ? ` (${t.count})` : ""}
              </button>
            ))}
          </div>

          {tab === "orders" && <ProfileOrders orders={orders} />}
          {tab === "cart" && <ProfileCart />}
          {tab === "reviews" && <ProfileReviews reviews={reviews} />}
          {tab === "saved" && <ProfileSavedItems />}
        </div>
      </div>
    </div>
  );
}