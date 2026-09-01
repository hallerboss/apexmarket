import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Upload, X, Plus, Pencil, Trash2, Search } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

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

  const uploadImage = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => ({ ...e, images: [...(e.images || []), file_url] }));
    setUploading(false);
  };
  const removeImage = (idx) => setEditing((e) => ({ ...e, images: e.images.filter((_, i) => i !== idx) }));

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
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="display-text text-2xl text-white">Products</h2>
          <p className="text-sm text-white mt-1">{products.length} objects in the archive</p>
        </div>
        <button onClick={startNew} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
        <input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-11" />
      </div>

      <div className="bg-[#0a0a0a] border border-white/5">
        {loading ? (
          <div className="p-12 text-center text-white text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white text-sm">No products found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-14 h-14 bg-white/5 shrink-0 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white"><ImageIcon className="w-5 h-5" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-white">{p.category} · {p.sku || "No SKU"} · Stock: {p.stock}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {p.featured && <span className="text-[9px] uppercase tracking-wide bg-accent/10 text-accent px-2 py-1">Featured</span>}
                  {p.is_new && <span className="text-[9px] uppercase tracking-wide bg-green-500/10 text-green-400 px-2 py-1">New</span>}
                  {p.status === "draft" && <span className="text-[9px] uppercase tracking-wide bg-white/10 text-white px-2 py-1">Draft</span>}
                </div>
                <div className="text-sm font-bold text-white shrink-0">${(p.sale_price || p.price).toFixed(2)}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(p)} className="p-2 text-white hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 text-white hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}