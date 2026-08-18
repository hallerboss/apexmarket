import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useCart } from "@/lib/cartContext";
import CompareToggle from "@/components/store/CompareToggle";

export default function ProductCard({ product, index = 0, compareMode = false }) {
  const { addItem } = useCart();
  const hasSale = product.sale_price && product.sale_price < product.price;
  const discount = hasSale ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

  return (
    <div className="product-card group">
      <Link to={`/product/${product.id}`} className="block img-wrap">
        {product.images?.[0] && (
          <Image src={product.images[0]} alt={product.name} className="w-full h-full" fittingType="fill" />
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new && (
            <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1">New</span>
          )}
          {hasSale && (
            <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">-{discount}%</span>
          )}
          {product.top_rated && (
            <span className="bg-white text-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-1 border hairline">Top</span>
          )}
        </div>
        {compareMode && <CompareToggle productId={product.id} />}
        {/* Quick add */}
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          className="absolute bottom-0 left-0 right-0 bg-foreground text-background text-[11px] font-semibold uppercase tracking-[0.2em] py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10"
        >
          Add to Cart
        </button>
      </Link>
      <div className="pt-4 pb-2">
        {product.brand && <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">{product.brand}</p>}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium leading-snug hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        </Link>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3 h-3 ${n <= Math.round(product.rating) ? "fill-foreground text-foreground" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">({product.reviews_count || 0})</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 mt-2.5">
          {hasSale ? (
            <>
              <span className="text-base font-bold text-accent">${product.sale_price.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-base font-bold">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}