import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";

const empty = { name: "", slug: "", description: "", image: "", parent: "", order: 0 };

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.Category.list("order", 100).then((d) => { setCats(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const save = (e) => {
    e.preventDefault();
    const data = { ...editing, slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-") };
    if (data.id) base44.entities.Category.update(data.id, data).then(() => { load(); setEditing(null); });
    else base44.entities.Category.create(data).then(() => { load(); setEditing(null); });
  };

  const uploadImg = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => ({ ...e, image: file_url }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="display-text text-2xl text-white">Categories</h2>
          <p className="text-sm text-white/40 mt-1">{cats.length} departments</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="bg-[#0a0a0a] border border-white/5 p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{editing.id ? "Edit Category" : "New Category"}</h3>
            <button type="button" onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="admin-label">Name</label><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="admin-input" /></div>
            <div><label className="admin-label">Parent (optional)</label><input value={editing.parent} onChange={(e) => setEditing({ ...editing, parent: e.target.value })} className="admin-input" /></div>
          </div>
          <div><label className="admin-label">Description</label><textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="admin-input resize-none" /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Image</label>
              {editing.image ? (
                <div className="relative aspect-video bg-white/5">
                  <img src={editing.image} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setEditing({ ...editing, image: "" })} className="absolute top-1 right-1 bg-black/70 p-1"><X className="w-3 h-3 text-white" /></button>
                </div>
              ) : (
                <label className="aspect-video border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-accent text-white/40">
                  <Upload className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImg(e.target.files[0])} />
                </label>
              )}
            </div>
            <div><label className="admin-label">Display Order</label><input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="admin-input" /></div>
          </div>
          <button type="submit" className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em]">{editing.id ? "Save" : "Create"}</button>
        </form>
      )}

      <div className="bg-[#0a0a0a] border border-white/5">
        {loading ? <div className="p-12 text-center text-white/30 text-sm">Loading…</div> : cats.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No categories yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {cats.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className="w-12 h-12 bg-white/5 shrink-0 overflow-hidden">
                  {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-white/40">{c.parent ? `Under ${c.parent}` : "Top level"} · Order {c.order}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...c })} className="p-2 text-white/50 hover:text-accent"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm("Delete?")) base44.entities.Category.delete(c.id).then(load); }} className="p-2 text-white/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}