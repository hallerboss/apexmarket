import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useCompare } from "@/lib/compareContext";
import { useCurrency } from "@/lib/currencyContext";
import { useCart } from "@/lib/cartContext";
import { Star, X, ShoppingCart, Trash2, ArrowLeft, GitCompare } from "lucide-react";

function variantOptions(product, pattern) {
  const v = (product.variants || []).find((vv) => new RegExp(pattern, "i").test(vv.name || ""));
  return v && v.options?.length ? v.options : null;
}

export default function Compare() {
  const { ids, remove, clear } = useCompare();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    Promise.all(ids.map((id) => base44.entities.Product.get(id).catch(() => null)))
      .then((res) => setProducts(res.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  const rows = [
    { label: "Price", get: (p) => formatPrice(p.sale_price || p.price) },
    { label: "Regular Price", get: (p) => (p.sale_price ? formatPrice(p.price) : "—") },
    {
      label: "Discount",
      get: (p) =>
        p.sale_price && p.sale_price < p.price
          ? `${Math.round(((p.price - p.sale_price) / p.price) * 100)}% off`
          : "—",
    },
    { label: "Brand", get: (p) => p.brand || "—" },
    { label: "Category", get: (p) => p.category || "—" },
    { label: "SKU", get: (p) => p.sku || "—" },
    {
      label: "Rating",
      get: (p) =>
        p.rating ? (
          <span className="flex items-center gap-1">
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(p.rating) ? "fill-[#ff9f43] text-[#ff9f43]" : "text-[#e5e5e5]"}`} />
              ))}
            </span>
            <span className="text-xs">{p.rating.toFixed(1)}</span>
          </span>
        ) : (
          "—"
        ),
    },
    { label: "Reviews", get: (p) => p.reviews_count || 0 },
    { label: "Total Sales", get: (p) => p.total_sales || 0 },
    { label: "Availability", get: (p) => (p.stock > 0 ? `${p.stock} in stock` : "Out of stock") },
    { label: "Colors", get: (p) => variantOptions(p, "color")?.join(", ") || "—" },
    { label: "Sizes", get: (p) => variantOptions(p, "size")?.join(", ") || "—" },
    { label: "Material", get: (p) => variantOptions(p, "material")?.join(", ") || "—" },
    { label: "Shipping", get: (p) => (p.shipping_options?.length ? p.shipping_options.map((s) => s.country).join(", ") : "—") },
    { label: "Google Shopping", get: (p) => (p.google_shopping ? "Listed" : "Not listed") },
    { label: "Tags", get: (p) => (p.tags?.length ? p.tags.join(", ") : "—") },
  ];

  // Highlight best value
  const lowestPrice = products.length ? Math.min(...products.map((p) => p.sale_price || p.price)) : null;

  if (loading) {
    return (
      <div className="container-bleed px-5 lg:px-10 py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-bleed px-5 lg:px-10 py-8 lg:py-12">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b hairline pb-6">
        <div>
          <h1 className="display-text text-3xl lg:text-4xl flex items-center gap-3">
            <GitCompare className="w-7 h-7 text-accent" /> Compare Products
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {products.length ? `${products.length} product${products.length === 1 ? "" : "s"} side-by-side` : "No products selected yet"}
          </p>
        </div>
        {products.length > 0 && (
          <button onClick={clear} className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="border-2 border-dashed border-[#e5e5e5] py-24 text-center">
          <GitCompare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-6">Select products from the shop to compare them here.</p>
          <Link to="/shop" className="btn-mono btn-mono-solid inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 lg:-mx-10 px-5 lg:px-10">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="w-28 p-4 text-left align-top sticky left-0 bg-background z-10"></th>
                {products.map((p) => {
                  const price = p.sale_price || p.price;
                  const isBest = price === lowestPrice && products.length > 1;
                  return (
                    <th key={p.id} className="p-4 text-left align-top min-w-[200px] border-l hairline">
                      <div className="relative">
                        <button
                          onClick={() => remove(p.id)}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-secondary hover:bg-destructive hover:text-white flex items-center justify-center rounded-full transition-colors z-10"
                          aria-label={`Remove ${p.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {isBest && (
                          <span className="absolute top-0 left-0 bg-green-600 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 z-10">Best Price</span>
                        )}
                        <Link to={`/product/${p.id}`}>
                          <div className={`aspect-square mb-3 bg-secondary overflow-hidden ${isBest ? "mt-6" : ""}`}>
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt={p.name} className="w-full h-full object-cover" fittingType="fit" />
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                          <p className="text-sm font-medium hover:text-accent line-clamp-2 leading-snug">{p.name}</p>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {p.is_new && <span className="text-[9px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5">New</span>}
                          {p.top_rated && <span className="text-[9px] uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5">Top Rated</span>}
                          {p.best_seller && <span className="text-[9px] uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5">Best Seller</span>}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-secondary/30" : ""}>
                  <td className="p-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold sticky left-0 bg-background whitespace-nowrap align-top">
                    {row.label}
                  </td>
                  {products.map((p) => {
                    const price = p.sale_price || p.price;
                    const isBest = row.label === "Price" && price === lowestPrice && products.length > 1;
                    return (
                      <td key={p.id} className={`p-4 text-sm border-l hairline align-top ${isBest ? "text-green-700 font-bold" : ""}`}>
                        {row.get(p)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Actions row */}
              <tr>
                <td className="p-4 sticky left-0 bg-background"></td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 border-l hairline">
                    <button
                      onClick={() => addItem(p)}
                      disabled={p.stock <= 0}
                      className="w-full bg-[#FFD814] text-[#0F1111] text-sm font-medium py-2.5 rounded-full hover:bg-[#f5c800] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to cart
                    </button>
                    <Link to={`/product/${p.id}`} className="block text-center text-xs text-muted-foreground hover:text-accent mt-2 uppercase tracking-[0.15em]">
                      View details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}