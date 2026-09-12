import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Upload, X, Plus, Pencil, Trash2, Search, Sparkles, Link2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ProductAgentChat from "@/components/admin/ProductAgentChat";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Pakistan", "India", "UAE", "Saudi Arabia", "China", "Japan", "Brazil", "Mexico", "South Africa"];
const COURIERS = ["Cainiao", "DHL Express", "FedEx", "UPS", "USPS", "Royal Mail", "Aramex", "TCS", "DPD", "Local Courier"];

const emptyProduct = {
  name: "", slug: "", description: "", short_description: "", price: 0, sale_price: 0,
  sku: "", category: "", brand: "", images: [], stock: 0, rating: 0, reviews_count: 0,
  featured: false, is_new: false, best_seller: false, top_rated: false, tags: [],
  variants: [], variant_images: [], seo_title: "", meta_description: "", focus_keywords: [],
  google_shopping: true, shipping_options: [], status: "published",
};

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [vUploading, setVUploading] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);

  const isNew = searchParams.get("new") === "1";

  const load = () => {
    setLoading(true);
    base44.entities.Product.list("-created_date", 100).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    base44.entities.Category.list("order", 100).then(setCategories).catch(() => {});
    if (isNew) setEditing({ ...emptyProduct });
  }, []);

  useEffect(() => {
    if (isNew) setEditing({ ...emptyProduct });
  }, [isNew]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // Hierarchical categories: top-level + children grouped by parent
  const tops = categories.filter((c) => !c.parent).sort((a, b) => (a.order || 0) - (b.order || 0));
  const childrenOf = (name) => categories.filter((c) => c.parent === name);

  const startEdit = (p) => {
    setEditing({
      ...emptyProduct, ...p,
      tags: p.tags || [], images: p.images || [],
      variants: p.variants || [], variant_images: p.variant_images || [],
      focus_keywords: p.focus_keywords || [], shipping_options: p.shipping_options || [],
    });
    setSearchParams({});
  };

  const startNew = () => {
    setEditing({ ...emptyProduct });
    setSearchParams({ new: "1" });
  };

  const save = (e) => {
    e.preventDefault();
    const data = { ...editing, slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-") };
    if (data.id) {
      base44.entities.Product.update(data.id, data).then(() => { load(); setEditing(null); });
    } else {
      base44.entities.Product.create(data).then(() => { load(); setEditing(null); setSearchParams({}); });
    }
  };

  const remove = (id) => {
    if (!confirm("Delete this product?")) return;
    base44.entities.Product.delete(id).then(load);
  };

  // Bulk edit / bulk delete
  const [selected, setSelected] = useState(new Set());
  const [bulkEdit, setBulkEdit] = useState(null);

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((p) => p.id)));
  const clearSel = () => setSelected(new Set());

  const bulkDelete = () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected product(s)?`)) return;
    Promise.all([...selected].map((id) => base44.entities.Product.delete(id))).then(() => { load(); setSelected(new Set()); });
  };

  const applyBulk = () => {
    const changes = {};
    if (bulkEdit.applyPrice) changes.price = parseFloat(bulkEdit.price) || 0;
    if (bulkEdit.applyCategory) changes.category = bulkEdit.category;
    if (bulkEdit.applyStock) changes.stock = parseInt(bulkEdit.stock) || 0;
    if (bulkEdit.applyStatus) changes.status = bulkEdit.status;
    if (!Object.keys(changes).length) { alert("Select at least one field to update."); return; }
    const updates = [...selected].map((id) => ({ id, ...changes }));
    base44.entities.Product.bulkUpdate(updates).then(() => { load(); setSelected(new Set()); setBulkEdit(null); });
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => ({ ...e, images: [...(e.images || []), file_url] }));
    setUploading(false);
  };
  const removeImage = (idx) => setEditing((e) => ({ ...e, images: e.images.filter((_, i) => i !== idx) }));

  const importFromUrl = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const res = await base44.functions.invoke("importProductFromUrl", { url: importUrl.trim() });
      const d = res.data?.product || {};
      setEditing({
        ...emptyProduct,
        name: d.name || "",
        description: d.description || "",
        short_description: d.short_description || "",
        price: d.price || 0,
        sale_price: d.sale_price || 0,
        brand: d.brand || "",
        category: d.category || "",
        sku: d.sku || "",
        images: d.images || [],
        variants: d.variants || [],
        tags: d.tags || [],
        status: "published",
      });
      setImportUrl("");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const insertFromAI = (data) => {
    const features = Array.isArray(data.tags) ? data.tags : [];
    const bullets = features.length ? `<ul>${features.map((f) => `<li>${f}</li>`).join("")}</ul>` : "";
    setEditing((e) => ({
      ...e,
      name: data.name || e.name,
      description: data.description || e.description,
      short_description: bullets || data.short_description || e.short_description,
      tags: features.length ? features : e.tags,
      seo_title: data.seo_title || e.seo_title,
      meta_description: data.meta_description || e.meta_description,
      focus_keywords: data.focus_keywords || e.focus_keywords,
      images: data.images ? [...(e.images || []), ...data.images.filter((u) => !(e.images || []).includes(u))] : e.images,
    }));
  };

  const analyzeImage = async () => {
    if (!editing.images?.length) { alert("Upload a product image first, then click AI Analyze."); return; }
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke("analyzeProductImage", { image_url: editing.images[0], product_name: editing.name });
      const d = res.data || res || {};
      const features = Array.isArray(d.features) ? d.features : [];
      const bullets = features.length ? `<ul>${features.map((f) => `<li>${f}</li>`).join("")}</ul>` : "";
      const desc = d.description ? (features.length ? `${d.description}${bullets}` : d.description) : null;
      setEditing((e) => ({
        ...e,
        description: desc || e.description,
        short_description: d.short_description || e.short_description,
        tags: features.length ? features : e.tags,
        seo_title: d.seo_title || e.seo_title,
        meta_description: d.meta_description || e.meta_description,
        focus_keywords: d.focus_keywords || e.focus_keywords,
      }));
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadVariantImage = async (variant, option, file) => {
    setVUploading(`${variant}-${option}`);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => {
      const rest = (e.variant_images || []).filter((v) => !(v.variant === variant && v.option === option));
      return { ...e, variant_images: [...rest, { variant, option, image: file_url }] };
    });
    setVUploading(null);
  };

  const setVariantName = (i, name) =>
    setEditing((e) => ({ ...e, variants: e.variants.map((v, j) => (j === i ? { ...v, name } : v)) }));
  const setVariantOptions = (i, opts) =>
    setEditing((e) => ({ ...e, variants: e.variants.map((v, j) => (j === i ? { ...v, options: opts } : v)) }));
  const addVariant = () =>
    setEditing((e) => ({ ...e, variants: [...e.variants, { name: "", options: [] }] }));
  const removeVariant = (i) =>
    setEditing((e) => ({ ...e, variants: e.variants.filter((_, j) => j !== i) }));

  const addShipping = () =>
    setEditing((e) => ({ ...e, shipping_options: [...(e.shipping_options || []), { country: "", courier: "" }] }));
  const setShipping = (i, field, val) =>
    setEditing((e) => ({ ...e, shipping_options: e.shipping_options.map((s, j) => (j === i ? { ...s, [field]: val } : s)) }));
  const removeShipping = (i) =>
    setEditing((e) => ({ ...e, shipping_options: e.shipping_options.filter((_, j) => j !== i) }));

  const variantImageFor = (variant, option) =>
    (editing.variant_images || []).find((v) => v.variant === variant && v.option === option)?.image;

  if (editing) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="display-text text-2xl text-white">{editing.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={() => { setEditing(null); setSearchParams({}); }} className="text-white hover:text-accent flex items-center gap-1.5 text-sm"><X className="w-4 h-4" /> Cancel</button>
        </div>

        <form onSubmit={save} className="grid lg:grid-cols-3 gap-8">
          {/* Main fields */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="admin-label">Title Product</label>
              <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="admin-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Price ($)</label>
                <input type="number" step="0.01" required value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Sale Price ($)</label>
                <input type="number" step="0.01" value={editing.sale_price} onChange={(e) => setEditing({ ...editing, sale_price: parseFloat(e.target.value) || 0 })} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Category</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="admin-input">
                  <option value="">— Select category —</option>
                  {tops.map((c) => {
                    const kids = childrenOf(c.name);
                    return kids.length ? (
                      <optgroup key={c.id} label={c.name}>
                        <option value={c.name}>{c.name}</option>
                        {kids.map((k) => <option key={k.id} value={k.name}>{c.name} › {k.name}</option>)}
                      </optgroup>
                    ) : (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="admin-label">Brand</label>
                <input value={editing.brand || ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">SKU</label>
                <input value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Stock</label>
                <input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="admin-label">Short Description</label>
              <RichTextEditor value={editing.short_description || ""} onChange={(html) => setEditing({ ...editing, short_description: html })} minHeight={140} title="Product short description" placeholder="One-line summary shown under the product title…" />
            </div>
            <div>
              <label className="admin-label">Full Description</label>
              <RichTextEditor value={editing.description || ""} onChange={(html) => setEditing({ ...editing, description: html })} minHeight={260} title="Product description" placeholder="Full product description — use the toolbar to format text, lists, links and images…" />
            </div>

            {/* SEO */}
            <div className="border-t border-white/10 pt-5">
              <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white mb-4">Google Search / SEO</h4>
              <div className="space-y-4">
                <div>
                  <label className="admin-label">SEO Title</label>
                  <input value={editing.seo_title || ""} onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })} className="admin-input" placeholder="Title for Google search results" />
                </div>
                <div>
                  <label className="admin-label">Meta Description</label>
                  <textarea rows={2} value={editing.meta_description || ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} className="admin-input resize-none" placeholder="Short description shown in search results" />
                </div>
                <div>
                  <label className="admin-label">Focus Keywords (comma separated)</label>
                  <input value={(editing.focus_keywords || []).join(", ")} onChange={(e) => setEditing({ ...editing, focus_keywords: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className="admin-input" placeholder="wireless headphones, bluetooth" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-white">
                  <input type="checkbox" checked={!!editing.google_shopping} onChange={(e) => setEditing({ ...editing, google_shopping: e.target.checked })} className="accent-accent w-4 h-4" />
                  List this product on Google Shopping
                </label>
              </div>
            </div>

            {/* Variations / Attributes */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white">Attributes & Variations</h4>
                <button type="button" onClick={addVariant} className="text-xs text-accent flex items-center gap-1 hover:underline"><Plus className="w-3.5 h-3.5" /> Add attribute</button>
              </div>
              <p className="text-[11px] text-white mb-4">e.g. Size, Color, Gender — or type your own. Upload a picture for any option (shown on the product page).</p>
              <div className="space-y-4">
                {editing.variants.length === 0 && <p className="text-sm text-white">No variations yet.</p>}
                {editing.variants.map((v, i) => {
                  const opts = (v.options || []).filter(Boolean);
                  return (
                    <div key={i} className="border border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <input placeholder="Attribute name (Size / Color / Gender…)" value={v.name} onChange={(e) => setVariantName(i, e.target.value)} className="admin-input flex-1" />
                        <button type="button" onClick={() => removeVariant(i)} className="text-white hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <input placeholder="Options (comma separated): S, M, L, XL" value={(v.options || []).join(", ")} onChange={(e) => setVariantOptions(i, e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="admin-input mb-3" />
                      {opts.length > 0 && v.name && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {opts.map((opt) => {
                            const img = variantImageFor(v.name, opt);
                            const loading = vUploading === `${v.name}-${opt}`;
                            return (
                              <div key={opt} className="border border-white/10 p-2 text-center">
                                <p className="text-xs text-white mb-2">{opt}</p>
                                <label className="block aspect-square bg-white/5 overflow-hidden cursor-pointer flex items-center justify-center">
                                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" /> :
                                   img ? <img src={img} alt={opt} className="w-full h-full object-cover" /> :
                                   <><Upload className="w-4 h-4 text-white" /><input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadVariantImage(v.name, opt, e.target.files[0])} /></>}
                                </label>
                                {img && <p className="text-[10px] text-green-400 mt-1">Image set</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping options */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white">Shipping Options</h4>
                <button type="button" onClick={addShipping} className="text-xs text-accent flex items-center gap-1 hover:underline"><Plus className="w-3.5 h-3.5" /> Add destination</button>
              </div>
              <div className="space-y-3">
                {(editing.shipping_options || []).length === 0 && <p className="text-sm text-white">No shipping destinations set.</p>}
                {(editing.shipping_options || []).map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <select value={s.country} onChange={(e) => setShipping(i, "country", e.target.value)} className="admin-input flex-1">
                      <option value="">Country…</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={s.courier} onChange={(e) => setShipping(i, "courier", e.target.value)} className="admin-input flex-1">
                      <option value="">Courier…</option>
                      {COURIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button type="button" onClick={() => removeShipping(i)} className="text-white hover:text-red-400 px-2"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="admin-label">Tags (comma separated)</label>
              <input value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className="admin-input" />
            </div>
          </div>

          {/* Sidebar: images, flags, status */}
          <div className="space-y-6">
            <div>
              <label className="admin-label">Product Images</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(editing.images || []).map((img, i) => (
                  <div key={i} className="relative aspect-square bg-white/5 overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <label className="aspect-square border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors text-white hover:text-accent">
                  {uploading ? <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" /> : <><Upload className="w-5 h-5 mb-1" /><span className="text-[10px]">Upload</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
                </label>
              </div>
              <p className="text-[10px] text-white">Upload high-quality studio images.</p>
              <button type="button" onClick={analyzeImage} disabled={analyzing} className="w-full mt-3 border border-accent text-accent py-2.5 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-accent hover:text-white disabled:opacity-50 transition-colors">
                <Sparkles className="w-4 h-4" /> {analyzing ? "Analyzing…" : "AI Analyze Image"}
              </button>
              <p className="text-[10px] text-white mt-2">Upload an image, then click to auto-generate description, 10 features & SEO from AI + web research.</p>
              <button type="button" onClick={() => setShowAgent(true)} className="w-full mt-3 border border-foreground/30 text-foreground py-2.5 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-foreground hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" /> Ask AI Assistant (Free)
              </button>
              <p className="text-[10px] text-white/60 mt-2">Chat with our AI agent to generate descriptions, SEO, or create products by conversation.</p>
            </div>

            <div>
              <label className="admin-label">Status</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="admin-input">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="admin-label">Flags</label>
              {[
                { key: "featured", label: "Featured" },
                { key: "is_new", label: "New Arrival" },
                { key: "best_seller", label: "Best Seller" },
                { key: "top_rated", label: "Top Rated" },
              ].map((f) => (
                <label key={f.key} className="flex items-center gap-3 cursor-pointer text-sm text-white">
                  <input type="checkbox" checked={!!editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} className="accent-accent w-4 h-4" />
                  {f.label}
                </label>
              ))}
            </div>

            <button type="submit" className="w-full bg-accent text-white py-3 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors">
              {editing.id ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
        {showAgent && <ProductAgentChat onClose={() => setShowAgent(false)} onInsert={insertFromAI} />}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="display-text text-2xl">Products</h2>
          <p className="text-sm text-black/50 mt-1">{products.length} objects in the archive</p>
        </div>
        <button onClick={startNew} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* URL Import */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          placeholder="Paste a product URL to auto-import details, images & variations…"
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && importUrl.trim()) importFromUrl(); }}
          className="admin-input flex-1"
        />
        <button
          onClick={importFromUrl}
          disabled={importing || !importUrl.trim()}
          className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {importing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing…</> : <><Link2 className="w-4 h-4" /> Import from URL</>}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
        <input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-11" />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 border border-accent/30 bg-accent/5 p-3">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <button onClick={() => setBulkEdit({ applyPrice: false, price: "", applyCategory: false, category: "", applyStock: false, stock: "", applyStatus: false, status: "published" })} className="bg-accent text-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90">Bulk Edit</button>
          <button onClick={bulkDelete} className="border border-red-300 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-red-50">Delete Selected</button>
          <button onClick={clearSel} className="text-xs uppercase tracking-[0.15em] text-black/50 hover:text-black">Clear</button>
        </div>
      )}

      {/* Bulk edit panel */}
      {bulkEdit && (
        <div className="mb-4 border border-[#e5e7eb] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Bulk Edit — {selected.size} products</h4>
            <button onClick={() => setBulkEdit(null)} className="text-black/50 hover:text-black"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bulkEdit.applyPrice} onChange={(e) => setBulkEdit({ ...bulkEdit, applyPrice: e.target.checked })} className="accent-accent w-4 h-4" /> Price ($)</label>
              <input type="number" step="0.01" disabled={!bulkEdit.applyPrice} value={bulkEdit.price} onChange={(e) => setBulkEdit({ ...bulkEdit, price: e.target.value })} className="admin-input disabled:opacity-40" placeholder="e.g. 29.99" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bulkEdit.applyCategory} onChange={(e) => setBulkEdit({ ...bulkEdit, applyCategory: e.target.checked })} className="accent-accent w-4 h-4" /> Category</label>
              <select disabled={!bulkEdit.applyCategory} value={bulkEdit.category} onChange={(e) => setBulkEdit({ ...bulkEdit, category: e.target.value })} className="admin-input disabled:opacity-40">
                <option value="">— Select category —</option>
                {tops.map((c) => { const kids = childrenOf(c.name); return kids.length ? (
                  <optgroup key={c.id} label={c.name}><option value={c.name}>{c.name}</option>{kids.map((k) => <option key={k.id} value={k.name}>{c.name} › {k.name}</option>)}</optgroup>
                ) : <option key={c.id} value={c.name}>{c.name}</option>; })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bulkEdit.applyStock} onChange={(e) => setBulkEdit({ ...bulkEdit, applyStock: e.target.checked })} className="accent-accent w-4 h-4" /> Stock</label>
              <input type="number" disabled={!bulkEdit.applyStock} value={bulkEdit.stock} onChange={(e) => setBulkEdit({ ...bulkEdit, stock: e.target.value })} className="admin-input disabled:opacity-40" placeholder="e.g. 100" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bulkEdit.applyStatus} onChange={(e) => setBulkEdit({ ...bulkEdit, applyStatus: e.target.checked })} className="accent-accent w-4 h-4" /> Status</label>
              <select disabled={!bulkEdit.applyStatus} value={bulkEdit.status} onChange={(e) => setBulkEdit({ ...bulkEdit, status: e.target.value })} className="admin-input disabled:opacity-40">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <button onClick={applyBulk} className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90">Apply to {selected.size} products</button>
        </div>
      )}

      <div className="bg-white border border-[#e5e7eb]">
        {loading ? (
          <div className="p-12 text-center text-black/40 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-black/40 text-sm">No products found.</div>
        ) : (
          <div className="divide-y divide-[#eef0f2]">
            <div className="px-5 py-3 flex items-center gap-4 bg-[#fafafa]">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-accent w-4 h-4" />
              <span className="text-[11px] uppercase tracking-[0.15em] text-black/50">{selected.size} of {filtered.length} selected</span>
            </div>
            {filtered.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#fafafa] transition-colors">
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="accent-accent w-4 h-4 shrink-0" />
                <div className="w-14 h-14 bg-[#f3f4f6] shrink-0 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-black/30"><ImageIcon className="w-5 h-5" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-black/50">{p.category} · {p.sku || "No SKU"} · Stock: {p.stock}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {p.featured && <span className="text-[9px] uppercase tracking-wide bg-accent/10 text-accent px-2 py-1">Featured</span>}
                  {p.is_new && <span className="text-[9px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-1">New</span>}
                  {p.status === "draft" && <span className="text-[9px] uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-1">Draft</span>}
                </div>
                <div className="text-sm font-bold shrink-0">${(p.sale_price || p.price).toFixed(2)}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(p)} className="p-2 text-black/60 hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 text-black/60 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}