import { useState } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Star, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";

export default function QuickViewModal({ product, onClose }) {
  const { addItem } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const hasSale = product.sale_price && product.sale_price < product.price;
  const images = product.images?.length ? product.images : [];

  const handleAdd = () => {
    const variantStr = Object.values(selectedVariants).join(", ") || null;
    addItem(product, qty, variantStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background w-full max-w-4xl max-h-[90vh] overflow-auto grid md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        <div className="relative bg-secondary">
          <div className="aspect-[3/4] md:aspect-auto md:h-full md:min-h-[420px] overflow-hidden">
            {images[activeImg] && <Image src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" fittingType="fill" />}
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-12 h-16 overflow-hidden border-2 transition-colors ${activeImg === i ? "border-foreground" : "border-transparent opacity-70"}`}
                >
                  <Image src={img} alt="" className="w-full h-full object-cover" fittingType="fill" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 lg:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            {product.brand && <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold">{product.brand}</p>}
            <button onClick={onClose} className="p-1 hover:text-accent -mt-1" aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
          <h2 className="display-text text-2xl lg:text-3xl mb-3">{product.name}</h2>
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(product.rating) ? "fill-foreground text-foreground" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviews_count || 0})</span>
            </div>
          )}
          <div className="flex items-baseline gap-3 mb-4">
            {hasSale ? (
              <>
                <span className="text-2xl font-bold text-accent">${product.sale_price.toFixed(2)}</span>
                <span className="text-base text-muted-foreground line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
          {product.short_description && <p className="serif-text text-muted-foreground leading-relaxed mb-6">{product.short_description}</p>}

          {product.variants?.map((v) => (
            <div key={v.name} className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">{v.name}</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariants((s) => ({ ...s, [v.name]: opt }))}
                    className={`px-3 py-2 text-sm border transition-colors ${selectedVariants[v.name] === opt ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <p className="text-sm mb-6">
            {product.stock > 0 ? <span className="text-green-600 font-medium">In stock</span> : <span className="text-destructive font-medium">Out of stock</span>}
          </p>

          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center border hairline">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:text-accent"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-2.5 hover:text-accent"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAdd} className="btn-mono-solid flex-1">
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