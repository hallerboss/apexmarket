import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SlidersHorizontal, X, LayoutGrid, Rows3, ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Slider } from "@/components/ui/slider";
import ShopProductCard from "@/components/store/ShopProductCard";
import AdSenseAd from "@/components/store/AdSenseAd";

const sortOptions = [
  { value: "newest", label: "Default sorting" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];
const showOptions = [12, 24, 36];
const colorMap = {
  black: "#000000", white: "#ffffff", navy: "#1e2a4a", blue: "#2563eb", red: "#dc2626",
  yellow: "#f59e0b", green: "#16a34a", grey: "#9ca3af", gray: "#9ca3af", brown: "#7c5e3c",
  beige: "#e8d8c0", pink: "#ec4899", silver: "#c0c0c0", gold: "#d4af37", purple: "#7c3aed", orange: "#f97316",
};
const colorFor = (n) => colorMap[String(n).toLowerCase()] || "#9ca3af";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceApplied, setPriceApplied] = useState([0, 500]);

  const activeCategory = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";
  const dealsOnly = searchParams.get("deals") === "1";
  const sort = searchParams.get("sort") || "newest";
  const showCount = parseInt(searchParams.get("show")) || 12;
  const view = searchParams.get("view") === "list" ? "list" : "grid";
  const selSizes = (searchParams.get("sizes") || "").split(",").filter(Boolean);
  const selColors = (searchParams.get("colors") || "").split(",").filter(Boolean);
  const selBrand = searchParams.get("brand") || "";
  const minPrice = parseInt(searchParams.get("min_price")) || 0;
  const maxPrice = parseInt(searchParams.get("max_price")) || 500;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.Product.list("-created_date", 200),
      base44.entities.Category.list("order", 100),
    ]).then(([p, c]) => {
      setProducts(p);
      setCats(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setPriceApplied([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const sizes = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      const sv = (p.variants || []).find((v) => /size/i.test(v.name || ""));
      (sv?.options || []).forEach((o) => (m[o] = (m[o] || 0) + 1));
    });
    return Object.entries(m).sort();
  }, [products]);

  const colors = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      const cv = (p.variants || []).find((v) => /color/i.test(v.name || ""));
      (cv?.options || []).forEach((o) => (m[o] = (m[o] || 0) + 1));
    });
    return Object.entries(m).sort();
  }, [products]);

  const brands = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      if (p.brand) m[p.brand] = (m[p.brand] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const catCounts = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      if (p.category) m[p.category] = (m[p.category] || 0) + 1;
    });
    return m;
  }, [products]);

  const catList = cats.length ? cats.map((c) => c.name) : Object.keys(catCounts);

  const filtered = useMemo(() => {
    let r = [...products];
    if (activeCategory) r = r.filter((p) => p.category === activeCategory);
    if (query) {
      const ql = query.toLowerCase();
      r = r.filter((p) =>
        p.name.toLowerCase().includes(ql) ||
        (p.category || "").toLowerCase().includes(ql) ||
        (p.brand || "").toLowerCase().includes(ql) ||
        (p.tags || []).some((t) => String(t).toLowerCase().includes(ql))
      );
    }
    if (dealsOnly) r = r.filter((p) => p.sale_price && p.sale_price < p.price);
    r = r.filter((p) => {
      const pr = p.sale_price || p.price;
      return pr >= minPrice && pr <= maxPrice;
    });
    if (selSizes.length)
      r = r.filter((p) => {
        const sv = (p.variants || []).find((v) => /size/i.test(v.name || ""));
        return sv?.options?.some((o) => selSizes.includes(o));
      });
    if (selColors.length)
      r = r.filter((p) => {
        const cv = (p.variants || []).find((v) => /color/i.test(v.name || ""));
        return cv?.options?.some((o) => selColors.includes(o));
      });
    if (selBrand) r = r.filter((p) => p.brand === selBrand);
    switch (sort) {
      case "price-asc": r.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price)); break;
      case "price-desc": r.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price)); break;
      case "rating": r.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return r;
  }, [products, activeCategory, query, dealsOnly, minPrice, maxPrice, selSizes, selColors, selBrand, sort]);

  const shown = filtered.slice(0, showCount);

  const setParam = (k, v) => {
    const n = new URLSearchParams(searchParams);
    if (v) n.set(k, v);
    else n.delete(k);
    setSearchParams(n);
  };
  const toggleArr = (k, val) => {
    const arr = (searchParams.get(k) || "").split(",").filter(Boolean);
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    setParam(k, next.join(","));
  };
  const applyPrice = () => {
    setParam("min_price", priceApplied[0] ? String(priceApplied[0]) : "");
    setParam("max_price", priceApplied[1] && priceApplied[1] < 500 ? String(priceApplied[1]) : "");
  };

  const renderFilters = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-[#333] uppercase tracking-wide mb-3">Categories</h3>
        <ul className="space-y-1.5">
          <li>
            <button onClick={() => setParam("category", "")} className={`w-full text-left text-sm py-1 ${!activeCategory ? "text-[#0066ff] font-medium" : "text-[#666] hover:text-[#0066ff]"}`}>
              All Products
            </button>
          </li>
          {catList.map((name) => (
            <li key={name} className="flex items-center justify-between">
              <button onClick={() => setParam("category", name)} className={`text-sm py-1 text-left ${activeCategory === name ? "text-[#0066ff] font-medium" : "text-[#666] hover:text-[#0066ff]"}`}>
                {name}
              </button>
              <span className="text-xs text-[#999]">{catCounts[name] || 0}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-bold text-[#333] uppercase tracking-wide mb-4">Price</h3>
        <Slider value={priceApplied} min={0} max={500} step={10} onValueChange={setPriceApplied} className="mb-3" />
        <p className="text-sm text-[#666] mb-3">
          Price: ${priceApplied[0]} — ${priceApplied[1] === 500 ? "500+" : priceApplied[1]}
        </p>
        <button onClick={applyPrice} className="bg-[#0066ff] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#0058d4]">
          Filter
        </button>
      </div>

      {/* Size */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#333] uppercase tracking-wide mb-3">Size</h3>
          <ul className="space-y-2">
            {sizes.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
                  <input type="checkbox" checked={selSizes.includes(name)} onChange={() => toggleArr("sizes", name)} className="accent-[#0066ff] w-4 h-4" />
                  {name}
                </label>
                <span className="text-xs text-[#999]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Color */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#333] uppercase tracking-wide mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map(([name]) => (
              <button
                key={name}
                title={name}
                onClick={() => toggleArr("colors", name)}
                className={`w-7 h-7 rounded-full border-2 ${selColors.includes(name) ? "border-[#0066ff] ring-2 ring-[#0066ff]/30" : "border-[#eee]"}`}
                style={{ backgroundColor: colorFor(name) }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#333] uppercase tracking-wide mb-3">Brand</h3>
          <ul className="space-y-2">
            {brands.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between">
                <button onClick={() => setParam("brand", selBrand === name ? "" : name)} className={`text-sm text-left ${selBrand === name ? "text-[#0066ff] font-medium" : "text-[#666] hover:text-[#0066ff]"}`}>
                  {name}
                </button>
                <span className="text-xs text-[#999]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Special */}
      <div>
        <h3 className="text-sm font-bold text-[#333] uppercase tracking-wide mb-3">Special</h3>
        <label className="flex items-center gap-2 text-sm text-[#666] cursor-pointer">
          <input type="checkbox" checked={dealsOnly} onChange={(e) => setParam("deals", e.target.checked ? "1" : "")} className="accent-[#0066ff] w-4 h-4" />
          On Sale Only
        </label>
      </div>
    </div>
  );

  return (
      <div>
        {/* Breadcrumbs */}
        <div className="border-b border-[#eee] bg-white">
          <div className="container-bleed px-5 lg:px-10 py-3 text-sm text-[#999] flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#0066ff]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#333]">{activeCategory || "Shop"}</span>
          </div>
        </div>

        {/* Page header */}
        <div className="border-b border-[#eee]">
          <div className="container-bleed px-5 lg:px-10 py-8 lg:py-12">
            <h1 className="display-text text-3xl lg:text-5xl text-[#333]">{activeCategory || "All Products"}</h1>
            <p className="text-sm text-[#666] mt-2">{filtered.length} products in the collection.</p>
          </div>
        </div>

        <div className="container-bleed px-5 lg:px-10 py-8 lg:py-12 flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 sticky top-36 self-start">
            {renderFilters()}
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#eee]">
              <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 text-sm text-[#333]">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <p className="text-sm text-[#666] hidden lg:block">{filtered.length} results</p>
              <div className="flex items-center gap-2 ml-auto">
                <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="bg-white border border-[#eee] rounded-md px-3 py-2 text-sm text-[#333] outline-none focus:border-[#0066ff]">
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select value={showCount} onChange={(e) => setParam("show", e.target.value)} className="bg-white border border-[#eee] rounded-md px-3 py-2 text-sm text-[#333] outline-none focus:border-[#0066ff]">
                  {showOptions.map((n) => (
                    <option key={n} value={n}>Show {n}</option>
                  ))}
                </select>
                <div className="flex items-center border border-[#eee] rounded-md overflow-hidden">
                  <button onClick={() => setParam("view", "grid")} className={`p-2 ${view === "grid" ? "bg-[#0066ff] text-white" : "text-[#666] hover:text-[#0066ff]"}`} aria-label="Grid view">
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setParam("view", "list")} className={`p-2 ${view === "list" ? "bg-[#0066ff] text-white" : "text-[#666] hover:text-[#0066ff]"}`} aria-label="List view">
                    <Rows3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-32 text-center">
                <div className="w-8 h-8 border-2 border-[#eee] border-t-[#0066ff] rounded-full animate-spin mx-auto" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-32 text-center">
                <p className="serif-text text-xl text-[#666]">No products match your selection.</p>
                <button onClick={() => setSearchParams(new URLSearchParams())} className="mt-4 text-sm text-[#0066ff] font-semibold">Clear filters</button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {shown.map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {shown.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="flex gap-4 bg-white border border-[#eee] rounded-md p-3 hover:shadow-md transition-shadow">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-[#f7f7f7] rounded-md overflow-hidden">
                      {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} className="w-full h-full" fittingType="fit" /> : <div className="w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-sm font-medium text-[#333] line-clamp-2">{p.name}</h3>
                      {p.rating > 0 && <p className="text-xs text-[#666] mt-1">★ {p.rating.toFixed(1)} ({p.reviews_count || 0})</p>}
                      <p className={`text-sm font-bold mt-1 ${p.sale_price ? "text-[#333]" : "text-[#333]"}`}>
                        {p.sale_price ? `$${p.sale_price.toFixed(2)}` : `$${p.price.toFixed(2)}`}
                        {p.sale_price && <span className="text-xs text-[#999] line-through ml-2">${p.price.toFixed(2)}</span>}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#999] self-center shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            <AdSenseAd slot="shop-listing" />

            {filtered.length > showCount && (
              <div className="text-center mt-8">
                <button onClick={() => setParam("show", String(showCount + 12))} className="border border-[#0066ff] text-[#0066ff] text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-[#0066ff] hover:text-white transition-colors">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#eee] sticky top-0 bg-white">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#333]">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-[#666]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">{renderFilters()}</div>
            <div className="p-5 sticky bottom-0 bg-white border-t border-[#eee]">
              <button onClick={() => setShowFilters(false)} className="w-full bg-[#0066ff] text-white text-sm font-semibold py-3 rounded-md">
                Show {filtered.length} results
              </button>
            </div>
          </div>
        )}
      </div>
  );
}