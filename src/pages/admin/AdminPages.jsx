import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Upload, Eye } from "lucide-react";

const empty = { title: "", slug: "", content: "", excerpt: "", featured_image: "", status: "published", show_in_menu: false };

export default function AdminPages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const isNew = searchParams.get("new") === "1";

  const load = () => {
    setLoading(true);
    base44.entities.Page.list("-created_date", 100).then((d) => { setPages(d); setLoading(false); });
  };
  useEffect(() => {
    load();
    if (isNew) setEditing({ ...empty });
  }, []);
  useEffect(() => { if (isNew) setEditing({ ...empty }); }, [isNew]);

  const save = (e) => {
    e.preventDefault();
    const data = { ...editing, slug: editing.slug || editing.title.toLowerCase().replace(/\s+/g, "-") };
    if (data.id) base44.entities.Page.update(data.id, data).then(() => { load(); setEditing(null); setSearchParams({}); });
    else base44.entities.Page.create(data).then(() => { load(); setEditing(null); setSearchParams({}); });
  };

  const uploadImg = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => ({ ...e, featured_image: file_url }));
  };

  if (editing) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="display-text text-2xl text-white">{editing.id ? "Edit Page" : "New Page"}</h2>
          <button onClick={() => { setEditing(null); setSearchParams({}); }} className="text-white/50 hover:text-white flex items-center gap-1.5 text-sm"><X className="w-4 h-4" /> Cancel</button>
        </div>
        <form onSubmit={save} className="space-y-5">
          <div><label className="admin-label">Title</label><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="admin-input" /></div>
          <div><label className="admin-label">Slug (URL)</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="admin-input" placeholder="about" /></div>
          <div><label className="admin-label">Excerpt</label><input value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="admin-input" /></div>
          <div>
            <label className="admin-label">Featured Image</label>
            {editing.featured_image ? (
              <div className="relative aspect-[16/6] bg-white/5 mb-2">
                <img src={editing.featured_image} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setEditing({ ...editing, featured_image: "" })} className="absolute top-2 right-2 bg-black/70 p-1.5"><X className="w-4 h-4 text-white" /></button>
              </div>
            ) : (
              <label className="aspect-[16/6] border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-accent text-white/40">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImg(e.target.files[0])} />
              </label>
            )}
          </div>
          <div>
            <label className="admin-label">Content (Markdown supported)</label>
            <textarea rows={14} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="admin-input resize-none font-mono text-xs" placeholder="## About Us&#10;&#10;Write your page content here…" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={editing.show_in_menu} onChange={(e) => setEditing({ ...editing, show_in_menu: e.target.checked })} className="accent-accent w-4 h-4" />
              Show in footer menu
            </label>
            <div className="flex items-center gap-2">
              <label className="admin-label mb-0">Status</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="admin-input w-auto">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-accent text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em]">{editing.id ? "Save Changes" : "Create Page"}</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="display-text text-2xl text-white">Pages</h2>
          <p className="text-sm text-white/40 mt-1">{pages.length} CMS pages</p>
        </div>
        <button onClick={() => { setEditing({ ...empty }); setSearchParams({ new: "1" }); }} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Page
        </button>
      </div>
      <div className="bg-[#0a0a0a] border border-white/5">
        {loading ? <div className="p-12 text-center text-white/30 text-sm">Loading…</div> : pages.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No pages yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {pages.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.title}</p>
                  <p className="text-xs text-white/40">/page/{p.slug}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-wide px-2 py-1 ${p.status === "published" ? "bg-green-500/10 text-green-400" : "bg-white/10 text-white/50"}`}>{p.status}</span>
                {p.show_in_menu && <span className="text-[9px] uppercase tracking-wide bg-accent/10 text-accent px-2 py-1 hidden sm:inline">Menu</span>}
                <div className="flex gap-1">
                  <a href={`/page/${p.slug}`} target="_blank" className="p-2 text-white/50 hover:text-accent"><Eye className="w-4 h-4" /></a>
                  <button onClick={() => setEditing({ ...p })} className="p-2 text-white/50 hover:text-accent"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm("Delete?")) base44.entities.Page.delete(p.id).then(load); }} className="p-2 text-white/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}