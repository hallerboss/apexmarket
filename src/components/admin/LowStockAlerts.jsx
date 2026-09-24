import { Link } from "react-router-dom";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

export default function LowStockAlerts({ products = [] }) {
  const low = products
    .filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-6 py-4 border-b border-[#eef0f2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-black">Low Stock Alerts</h3>
          {low.length > 0 && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {low.length}
            </span>
          )}
        </div>
        <Link to="/admin/products" className="text-[11px] uppercase tracking-[0.15em] text-accent hover:underline">
          Manage
        </Link>
      </div>

      {low.length === 0 ? (
        <div className="p-8 text-center text-sm text-black/40">
          All products are well stocked — nothing needs restocking right now.
        </div>
      ) : (
        <div className="divide-y divide-[#eef0f2] max-h-96 overflow-y-auto">
          {low.map((p) => {
            const out = (p.stock ?? 0) <= 0;
            return (
              <div key={p.id} className="px-6 py-3 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f3f4f6] shrink-0 overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/30">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-black">{p.name}</p>
                  <p className="text-xs text-black/50 truncate">{p.category || "Uncategorized"}</p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-1 shrink-0 ${
                    out ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {out ? "Out of stock" : `${p.stock} left`}
                </span>
                <Link
                  to="/admin/products"
                  className="p-2 text-black/40 hover:text-accent shrink-0"
                  aria-label={`Restock ${p.name}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}