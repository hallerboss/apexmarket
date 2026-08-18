import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Image } from "@/components/ui/image";

const rows = [
  { label: "Price", get: (p) => `$${(p.sale_price || p.price).toFixed(2)}` },
  { label: "Brand", get: (p) => p.brand || "—" },
  { label: "Category", get: (p) => p.category || "—" },
  { label: "Rating", get: (p) => (p.rating ? `${p.rating} / 5` : "—") },
  { label: "Reviews", get: (p) => p.reviews_count || 0 },
  { label: "SKU", get: (p) => p.sku || "—" },
  { label: "Stock", get: (p) => (p.stock > 0 ? `${p.stock} available` : "Out of stock") },
  { label: "Pricing", get: (p) => (p.sale_price && p.sale_price < p.price ? "On Sale" : "Standard") },
  { label: "Tags", get: (p) => (p.tags?.length ? p.tags.join(", ") : "—") },
];

export default function CompareModal({ products, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background w-full max-w-6xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b hairline px-5 py-4 flex items-center justify-between z-10">
          <h2 className="display-text text-2xl">Compare Products</h2>
          <button onClick={onClose} className="p-2 hover:text-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-32 p-4 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground sticky left-0 bg-background align-top"></th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 text-left align-top min-w-[180px] border-l hairline">
                    <Link to={`/product/${p.id}`} onClick={onClose}>
                      {p.images?.[0] && (
                        <div className="aspect-[3/4] mb-3 bg-secondary overflow-hidden">
                          <Image src={p.images[0]} alt={p.name} className="w-full h-full object-cover" fittingType="fill" />
                        </div>
                      )}
                      <p className="text-sm font-medium hover:text-accent line-clamp-2">{p.name}</p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-secondary/40" : ""}>
                  <td className="p-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold sticky left-0 bg-background">
                    {row.label}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-sm border-l hairline">{row.get(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}