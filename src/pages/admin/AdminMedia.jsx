import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Film as FilmIcon, X, Download, UploadCloud } from "lucide-react";

const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url || "");

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.Product.list("-created_date", 200),
      base44.entities.Review.list("-created_date", 200),
      base44.entities.Banner.list("-created_date", 200),
      base44.entities.Category.list("order", 200),
      base44.entities.Media.list("-created_date", 200),
    ])
      .then(([products, reviews, banners, categories, media]) => {
        const list = [];
        media.forEach((m) => list.push({ id: m.id, url: m.url, type: m.type || (isVideo(m.url) ? "video" : "image"), source: "Uploaded", name: m.name || "Upload" }));
        products.forEach((p) => (p.images || []).forEach((url) => list.push({ url, type: isVideo(url) ? "video" : "image", source: "Product", name: p.name })));
        reviews.forEach((r) => (r.media || []).forEach((url) => list.push({ url, type: isVideo(url) ? "video" : "image", source: "Review", name: r.product_name || r.author || "Review" })));
        banners.forEach((b) => b.image && list.push({ url: b.image, type: "image", source: "Banner", name: b.title }));
        categories.forEach((c) => c.image && list.push({ url: c.image, type: "image", source: "Category", name: c.name }));
        setItems(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFiles = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setUploading(arr.length);
    for (const file of arr) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.Media.create({ url: file_url, type: isVideo(file.name) ? "video" : "image", name: file.name, source: "upload" });
      } catch (_) {}
      setUploading((n) => Math.max(0, n - 1));
    }
    load();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeUploaded = async (item) => {
    if (!item.id) return;
    if (!confirm("Delete this uploaded file?")) return;
    await base44.entities.Media.delete(item.id);
    setActive(null);
    load();
  };

  const sources = ["all", "Uploaded", "Product", "Review", "Banner", "Category"];
  const shown = filter === "all" ? items : items.filter((i) => i.source === filter);

  return (
    <div>
      <div className="mb-8">
        <h2 className="display-text text-2xl">Media Library</h2>
        <p className="text-sm text-black/50 mt-1">{items.length} files across products, reviews, banners & categories</p>
      </div>

      {/* Drag & drop upload */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 mb-6 cursor-pointer transition-colors ${dragOver ? "border-accent bg-accent/5" : "border-[#d4d4d8] bg-[#fafafa] hover:border-accent"}`}
      >
        <UploadCloud className="w-8 h-8 text-accent" />
        <p className="text-sm font-semibold text-black">{uploading > 0 ? `Uploading ${uploading} file(s)…` : "Drag & drop images or videos here"}</p>
        <p className="text-xs text-black/50">or click to browse from your computer</p>
        <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
      </label>

      <div className="flex flex-wrap gap-2 mb-6">
        {sources.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] border transition-colors ${filter === s ? "bg-accent text-white border-accent" : "border-[#e5e7eb] text-black/60 hover:border-accent"}`}>
            {s === "all" ? "All" : s + (s === "Uploaded" ? "" : "s")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-black/40 text-sm">Loading media…</div>
      ) : shown.length === 0 ? (
        <div className="p-12 text-center text-black/40 text-sm">No media found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {shown.map((item, i) => (
            <div key={i} className="group relative aspect-square bg-[#f3f4f6] overflow-hidden border border-[#e5e7eb]">
              <button onClick={() => setActive(item)} className="block w-full h-full">
                {item.type === "video" ? <video src={item.url} className="w-full h-full object-cover" muted /> : <img src={item.url} alt="" className="w-full h-full object-cover" />}
              </button>
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-wide bg-black/70 text-white px-1.5 py-0.5">{item.source}</span>
              {item.type === "video" && <FilmIcon className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white" />}
              {item.id && (
                <button onClick={() => removeUploaded(item)} className="absolute bottom-1.5 right-1.5 bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete"><X className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setActive(null)}>
          <div className="relative max-w-3xl w-full bg-white" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActive(null)} className="absolute -top-10 right-0 text-white hover:text-accent"><X className="w-6 h-6" /></button>
            {active.type === "video" ? <video src={active.url} controls className="w-full max-h-[70vh]" /> : <img src={active.url} alt="" className="w-full max-h-[70vh] object-contain" />}
            <div className="p-4 flex items-center justify-between">
              <div><p className="text-sm font-semibold">{active.name}</p><p className="text-xs text-black/50">{active.source} · {active.type}</p></div>
              <div className="flex items-center gap-2">
                {active.id && <button onClick={() => removeUploaded(active)} className="text-xs font-semibold uppercase tracking-[0.15em] text-red-600 border border-red-300 px-3 py-2 hover:bg-red-50">Delete</button>}
                <a href={active.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent border border-accent px-3 py-2 hover:bg-accent hover:text-white"><Download className="w-3.5 h-3.5" /> Open</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}