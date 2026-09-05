import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Film as FilmIcon, X, Download } from "lucide-react";

const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url || "");

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list("-created_date", 200),
      base44.entities.Review.list("-created_date", 200),
      base44.entities.Banner.list("-created_date", 200),
      base44.entities.Category.list("order", 200),
    ])
      .then(([products, reviews, banners, categories]) => {
        const list = [];
        products.forEach((p) => (p.images || []).forEach((url) => list.push({ url, type: isVideo(url) ? "video" : "image", source: "Product", name: p.name })));
        reviews.forEach((r) => (r.media || []).forEach((url) => list.push({ url, type: isVideo(url) ? "video" : "image", source: "Review", name: r.product_name || r.author || "Review" })));
        banners.forEach((b) => b.image && list.push({ url: b.image, type: "image", source: "Banner", name: b.title }));
        categories.forEach((c) => c.image && list.push({ url: c.image, type: "image", source: "Category", name: c.name }));
        setItems(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const sources = ["all", "Product", "Review", "Banner", "Category"];
  const shown = filter === "all" ? items : items.filter((i) => i.source === filter);

  return (
    <div>
      <div className="mb-8">
        <h2 className="display-text text-2xl">Media Library</h2>
        <p className="text-sm text-black/50 mt-1">{items.length} files across products, reviews, banners & categories</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {sources.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] border transition-colors ${filter === s ? "bg-accent text-white border-accent" : "border-[#e5e7eb] text-black/60 hover:border-accent"}`}>
            {s === "all" ? "All" : s + "s"}
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
            <button key={i} onClick={() => setActive(item)} className="group relative aspect-square bg-[#f3f4f6] overflow-hidden border border-[#e5e7eb]">
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-wide bg-black/70 text-white px-1.5 py-0.5">{item.source}</span>
              {item.type === "video" && <FilmIcon className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white" />}
            </button>
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
              <a href={active.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent border border-accent px-3 py-2 hover:bg-accent hover:text-white"><Download className="w-3.5 h-3.5" /> Open</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}