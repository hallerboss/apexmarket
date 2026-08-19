import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";

const empty = { title: "", subtitle: "", description: "", image: "", link: "/shop", cta_text: "Shop Now", position: "promo", order: 0, active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.Banner.list("order", 50).then((d) => { setBanners(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const save = (e) => {
    e.preventDefault();
    if (editing.id) base44.entities.Banner.update(editing.id, editing).then(() => { load(); setEditing(null); });
    else base44.entities.Banner.create(editing).then(() => { load(); setEditing(null); });
  };

  const uploadImg = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => ({ ...e, image: file_url }));
  };

  if (editing) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="display-text text-2xl text-white">{editing.id ? "Edit Banner" : "New Banner"}</h2>
          <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={save} className="space-y-5">
          <div><label className="admin-label">Title</label><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="admin-input" /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="admin-label">Subtitle</label><input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="admin-input" /></div>
            <div><label className="admin-label">CTA Text</label><input value={editing.cta_text} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} className="admin-input" /></div>
          </div>
          <div><label className="admin-label">Description</label><textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="admin-input resize-none" /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="admin-label">Link</label><input value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="admin-input" /></div>
            <div>
              <label className="admin-label">Position</label>
              <select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className="admin-input">
                <option value="hero">Hero</option><option value="promo">Promo</option><option value="midpage">Mid-page</option><option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="admin-label">Banner Image</label>
            {editing.image ? (
              <div className="relative aspect-[16/6] bg-white/5">
                <img src={editing.image} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setEditing({ ...editing, image: "" })} className="absolute top-2 right-2 bg-black/70 p-1.5"><X className="w-4 h-4 text-white" /></button>
              </div>
            ) : (
              <label className="aspect-[16/6] border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-accent text-white/40">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImg(e.target.files[0])} />
              </label>
            )}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="accent-accent w-4 h-4" /> Active
            </label>
            <div><label className="admin-label">Order</label><input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="admin-input w-24" /></div>
          </div>
          <button type="submit" className="bg-accent text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em]">{editing.id ? "Save" : "Create"}</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="display-text text-2xl text-white">Banners</h2>
          <p className="text-sm text-white/40 mt-1">{banners.length} promotional banners</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {loading ? <div className="w-full p-12 text-center text-white/30 text-sm">Loading…</div> : banners.length === 0 ? (
          <div className="w-full p-12 text-center text-white/30 text-sm">No banners yet.</div>
        ) : banners.map((b) => (
          <div key={b.id} className="bg-[#0a0a0a] border border-white/5 overflow-hidden min-w-[280px] shrink-0 w-[280px]">
            <div className="relative aspect-[16/6] bg-white/5">
              {b.image && <img src={b.image} alt="" className="w-full h-full object-cover" />}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="text-[9px] uppercase tracking-wide bg-black/70 text-white px-2 py-1">{b.position}</span>
                {!b.active && <span className="text-[9px] uppercase tracking-wide bg-red-500/80 text-white px-2 py-1">Inactive</span>}
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-white">{b.title}</p>
              {b.subtitle && <p className="text-xs text-white/40">{b.subtitle}</p>}
              <div className="flex gap-1 mt-3">
                <button onClick={() => setEditing({ ...b })} className="p-2 text-white/50 hover:text-accent"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm("Delete?")) base44.entities.Banner.delete(b.id).then(load); }} className="p-2 text-white/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}