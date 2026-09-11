import { Link } from "react-router-dom";
import { Star, Check, Eye } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";
import { useQuickView } from "@/lib/quickViewContext";
import WishlistToggle from "@/components/store/WishlistToggle";

export default function ShopProductCard({ product }) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { open: openQuickView } = useQuickView();
  const hasSale = product.sale_price && product.sale_price < product.price;
  const discount = hasSale ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  const inStock = (product.stock ?? 0) > 0;
  const hasVariants = (product.variants || []).length > 0;

  return (
    <div className="group relative bg-white border border-[#eee] rounded-md p-3 flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/product/${product.id}`} className="relative block aspect-square bg-[#f7f7f7] rounded-md overflow-hidden mb-3">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} className="w-full h-full" fittingType="fit" />
        ) : (
          <div className="w-full h-full" />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasSale && <span className="bg-[#ff9f43] text-white text-[11px] font-bold px-2 py-0.5 rounded">-{discount}%</span>}
          {product.best_seller && <span className="bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">HOT</span>}
          {product.is_new && !hasSale && !product.best_seller && <span className="bg-[#0066ff] text-white text-[11px] font-bold px-2 py-0.5 rounded">NEW</span>}
        </div>
        <WishlistToggle productId={product.id} className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 border border-[#eee] rounded-full hover:border-red-400" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
          className="absolute bottom-0 inset-x-0 z-10 bg-black/80 text-white text-xs font-semibold py-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Quick view"
        >
          Quick View
        </button>
      </Link>

      <Link to={`/product/${product.id}`}>
        <h3 className="text-sm text-[#333] font-medium leading-snug line-clamp-2 hover:text-[#0066ff] transition-colors min-h-[2.5rem]">{product.name}</h3>
      </Link>

      {product.rating > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(product.rating) ? "fill-[#ff9f43] text-[#ff9f43]" : "text-[#e5e5e5]"}`} />
            ))}
          </div>
          <span className="text-xs text-[#666]">({product.reviews_count || 0})</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${inStock ? "bg-[#0066ff]" : "bg-[#ccc]"}`}>
          <Check className="w-2.5 h-2.5 text-white" />
        </span>
        <span className={`text-xs ${inStock ? "text-[#333]" : "text-[#999]"}`}>{inStock ? "In stock" : "Out of stock"}</span>
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        {hasSale ? (
          <>
            <span className="text-base font-bold text-[#333]">{formatPrice(product.sale_price)}</span>
            <span className="text-sm text-[#999] line-through">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="text-base font-bold text-[#333]">{formatPrice(product.price)}</span>
        )}
      </div>

      <div className="mt-3">
        {hasVariants ? (
          <Link to={`/product/${product.id}`} className="block w-full text-sm font-semibold text-[#0066ff] border border-[#0066ff] rounded-md py-2 text-center hover:bg-[#0066ff] hover:text-white transition-colors">
            Select options
          </Link>
        ) : (
          <button onClick={() => addItem(product)} disabled={!inStock} className="w-full text-sm font-semibold text-[#0066ff] border border-[#0066ff] rounded-md py-2 hover:bg-[#0066ff] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}