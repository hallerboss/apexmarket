import { useState } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Star, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";
import { cleanHtml } from "@/lib/cleanHtml";
import ProductImageZoom from "@/components/store/ProductImageZoom";
import ProductVariantSelector from "@/components/store/ProductVariantSelector";

export default function QuickViewModal({ product, onClose }) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [activeImg, setActiveImg] = useState(0);
  const [variantPreview, setVariantPreview] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const hasSale = product.sale_price && product.sale_price < product.price;
  const images = product.images?.length ? product.images : [];
  const mainImage = variantPreview || images[activeImg];
  const variantImageFor = (variant, option) =>
    (product.variant_images || []).find((v) => v.variant === variant && v.option === option)?.image;
  const allVariantsSelected = (product.variants || []).every((v) => selectedVariants[v.name]);
  const inStock = (product.stock ?? 0) > 0;
  const canAdd = inStock && allVariantsSelected;

  const handleAdd = () => {
    if (!canAdd) return;
    const variantStr = Object.values(selectedVariants).join(", ") || null;
    addItem(product, qty, variantStr);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-4xl my-auto grid md:grid-cols-2 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media — same 600×750 frame + hover/tap zoom as the product page */}
        <div className="relative bg-secondary">
          <div className="aspect-[4/5] md:aspect-auto md:h-full md:min-h-[420px] overflow-hidden">
            <ProductImageZoom src={mainImage} alt={product.name} className="w-full h-full" />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setVariantPreview(null); }}
                  className={`w-12 h-[60px] shrink-0 overflow-hidden border-2 transition-colors ${!variantPreview && activeImg === i ? "border-foreground" : "border-transparent opacity-70"}`}
                >
                  <Image src={img} alt="" className="w-full h-full object-cover" fittingType="fill" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 sm:p-6 lg:p-8 flex flex-col">
          <div className="flex justify-end mb-3">
            <button onClick={onClose} className="p-1 hover:text-accent -mt-1 shrink-0" aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
          <h2 className="display-text text-2xl lg:text-3xl mb-3">{product.name}</h2>
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(product.rating) ? "fill-[#ff9f43] text-[#ff9f43]" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviews_count || 0})</span>
            </div>
          )}
          <div className="flex items-baseline gap-3 mb-4">
            {hasSale ? (
              <>
                <span className="text-2xl font-bold text-accent">{formatPrice(product.sale_price)}</span>
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.short_description && (
            <div
              className="serif-text text-muted-foreground leading-relaxed mb-5 break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: cleanHtml(product.short_description) }}
            />
          )}

          <ProductVariantSelector
            variants={product.variants}
            selected={selectedVariants}
            onSelect={(name, opt) => setSelectedVariants((s) => ({ ...s, [name]: opt }))}
            variantImageFor={variantImageFor}
            onImageSelect={(imgUrl) => setVariantPreview(imgUrl)}
          />
          {product.variants?.length > 0 && !allVariantsSelected && (
            <p className="text-xs text-amber-600 mb-4">Please select all options above before adding to cart.</p>
          )}

          {/* Stock indicator — matches the product page */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              {inStock && <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${inStock ? "bg-green-500" : "bg-destructive"}`} />
            </span>
            {inStock ? (
              <span className="text-sm font-medium text-green-600">In stock — {product.stock} available</span>
            ) : (
              <span className="text-sm font-medium text-destructive">Out of stock</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-auto">
            <div className="flex items-center border hairline w-full sm:w-auto justify-between sm:justify-start">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:text-accent"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => (inStock ? Math.min(product.stock, q + 1) : q))} className="p-2.5 hover:text-accent"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAdd} disabled={!canAdd} className="btn-mono-solid flex-1 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
          </div>
          <Link to={`/product/${product.id}`} onClick={onClose} className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent mt-4">
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}