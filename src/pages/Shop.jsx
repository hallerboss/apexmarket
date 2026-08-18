import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import { CompareProvider } from "@/lib/compareContext";
import CompareBar from "@/components/store/CompareBar";

const categories = ["Electronics", "Fashion", "Furniture", "Watches", "Accessories"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";
  const dealsOnly = searchParams.get("deals") === "1";
  const sort = searchParams.get("sort") || "newest";
  const maxPrice = parseInt(searchParams.get("max_price")) || 0;

  useEffect(() => {
    setLoading(true);
    base44.entities.Product.list("-created_date", 100).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (query) result = result.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (dealsOnly) result = result.filter((p) => p.sale_price && p.sale_price < p.price);
    if (maxPrice) result = result.filter((p) => (p.sale_price || p.price) <= maxPrice);
    switch (sort) {
      case "price-asc": result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price)); break;
      case "price-desc": result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price)); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return result;
  }, [products, activeCategory, query, dealsOnly, maxPrice, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <CompareProvider>
    <div>
      {/* Page header */}
      <div className="border-b hairline">
        <div className="container-bleed px-5 lg:px-10 py-12 lg:py-20">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-4">The Archive</p>
          <h1 className="display-text text-5xl lg:text-7xl">
            {activeCategory || "All Products"}
          </h1>
          <p className="serif-text text-muted-foreground mt-4 max-w-lg">
            {filtered.length} objects in the collection. Curated for the modern ritual of commerce.
          </p>
        </div>
      </div>

      <div className="container-bleed px-5 lg:px-10 py-10 lg:py-16 flex gap-10">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
          <div className="flex items-center gap-2 mb-8">
            <SlidersHorizontal className="w-4 h-4" />
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold">Filters</h3>
          </div>
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Category</p>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => setParam("category", "")} className={`text-sm text-left hover:text-accent transition-colors ${!activeCategory ? "text-accent font-semibold" : "text-foreground"}`}>All</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setParam("category", c)} className={`text-sm text-left hover:text-accent transition-colors ${activeCategory === c ? "text-accent font-semibold" : "text-foreground"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Special</p>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={dealsOnly} onChange={(e) => setParam("deals", e.target.checked ? "1" : "")} className="accent-accent w-4 h-4" />
              On Sale Only
            </label>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Max Price</p>
            <input type="range" min="0" max="500" step="10" value={maxPrice || 500} onChange={(e) => setParam("max_price", e.target.value === "500" ? "" : e.target.value)} className="w-full accent-accent" />
            <p className="text-sm mt-2">{maxPrice ? `$${maxPrice}` : "Any"}</p>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 text-sm">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <p className="text-sm text-muted-foreground hidden lg:block">{filtered.length} results</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hidden sm:block">Sort</span>
              <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="bg-transparent border hairline px-3 py-2 text-sm outline-none focus:border-accent">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-32 text-center"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="serif-text text-xl text-muted-foreground">No objects match your selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} compareMode />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex items-center justify-between p-5 border-b hairline">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Category</p>
            <div className="flex flex-col gap-2.5 mb-8">
              <button onClick={() => { setParam("category", ""); setShowFilters(false); }} className={`text-sm text-left ${!activeCategory ? "text-accent font-semibold" : ""}`}>All</button>
              {categories.map((c) => (
                <button key={c} onClick={() => { setParam("category", c); setShowFilters(false); }} className={`text-sm text-left ${activeCategory === c ? "text-accent font-semibold" : ""}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    <CompareBar />
    </CompareProvider>
  );
}