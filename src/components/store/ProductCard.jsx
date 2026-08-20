import { Link } from "react-router-dom";
import { Star, Check } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useCart } from "@/lib/cartContext";
import CompareToggle from "@/components/store/CompareToggle";

const colorMap = {
  black: "#000000", white: "#ffffff", navy: "#1e2a4a", blue: "#2563eb",
  red: "#dc2626", yellow: "#f59e0b", green: "#16a34a", gray: "#9ca3af",
  grey: "#9ca3af", brown: "#7c5e3c", beige: "#e8d8c0", pink: "#ec4899",
  silver: "#c0c0c0", gold: "#d4af37", purple: "#7c3aed", orange: "#f97316",
};
const colorFor = (n) => colorMap[String(n).toLowerCase()] || "#9ca3af";
const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function ProductCard({ product, index = 0, compareMode = false }) {
  const { addItem } = useCart();
  const hasSale = product.sale_price && product.sale_price < product.price;
  const discount = hasSale ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  const colorVariant = (product.variants || []).find((v) => /color/i.test(v.name || ""));
  const inStock = (product.stock ?? 0) > 0;

  return (
    <div className="group relative bg-white border border-[#eeeeee] rounded-md overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/product/${product.id}`} className="relative block bg-white aspect-square overflow-hidden">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} className="w-full h-full" fittingType="fit" />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        {hasSale && (
          <span className="absolute top-2 left-2 bg-[#ff9f43] text-white text-[11px] font-bold px-2 py-1 rounded-sm">
            {discount}% OFF
          </span>
        )}
        {product.is_new && !hasSale && (
          <span className="absolute top-2 left-2 bg-foreground text-white text-[11px] font-bold px-2 py-1 rounded-sm">NEW</span>
        )}
        {compareMode && <CompareToggle productId={product.id} />}
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {product.brand && <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.brand}</p>}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm text-foreground font-normal leading-snug line-clamp-2 hover:text-accent transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3.5 h-3.5 ${n <= Math.round(product.rating) ? "fill-[#ff9f43] text-[#ff9f43]" : "text-[#e5e5e5]"}`}
                />
              ))}
            </div>
            <span className="text-xs text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.reviews_count || 0})</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs">
          <Check className={`w-3.5 h-3.5 ${inStock ? "text-accent" : "text-muted-foreground"}`} />
          <span className={inStock ? "text-foreground" : "text-muted-foreground"}>{inStock ? "In stock" : "Out of stock"}</span>
        </div>

        <div className="flex items-baseline gap-2">
          {hasSale ? (
            <>
              <span className="text-lg font-medium text-foreground">{fmt(product.sale_price)}</span>
              <span className="text-sm text-muted-foreground line-through">{fmt(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-medium text-foreground">{fmt(product.price)}</span>
          )}
        </div>

        {colorVariant && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {colorVariant.options.slice(0, 6).map((o) => (
              <span
                key={o}
                title={o}
                className="w-4 h-4 rounded-full border border-[#e5e5e5]"
                style={{ backgroundColor: colorFor(o) }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-1">
          <button
            onClick={() => addItem(product)}
            className="w-full text-sm font-medium bg-[#FFD814] text-[#0F1111] py-2.5 rounded-full hover:bg-[#f5c800] transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}