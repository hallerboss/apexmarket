import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Star, Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield, Zap, GitCompare } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";
import { useWishlist } from "@/lib/wishlistContext";
import { useCompare } from "@/lib/compareContext";
import WishlistToggle from "@/components/store/WishlistToggle";
import { trackProductView } from "@/lib/analytics";
import ProductCard from "@/components/store/ProductCard";
import FrequentlyBoughtTogether from "@/components/store/FrequentlyBoughtTogether";
import CustomerReviews from "@/components/store/CustomerReviews";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [showBuyBar, setShowBuyBar] = useState(false);
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { has: hasCompare, toggle: toggleCompare } = useCompare();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    base44.entities.Product.get(id).then((p) => {
      setProduct(p);
      setLoading(false);
      trackProductView(p);
      base44.entities.Product.filter({ category: p.category }, "-rating", 5).then((rel) =>
        setRelated(rel.filter((r) => r.id !== p.id).slice(0, 4))
      );
    });
  }, [id]);

  useEffect(() => {
    const unsubscribe = base44.entities.Product.subscribe((event) => {
      if (event.id === id && event.type === "update") {
        setProduct((cur) => (cur ? { ...cur, ...event.data } : cur));
      }
    });
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    const onScroll = () => setShowBuyBar(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return <div className="container-bleed px-5 lg:px-10 py-32 text-center"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>;
  }
  if (!product) {
    return <div className="container-bleed px-5 lg:px-10 py-32 text-center"><p className="serif-text text-xl">Product not found.</p><Link to="/shop" className="btn-mono-outline mt-6 inline-flex">Back to Shop</Link></div>;
  }

  const hasSale = product.sale_price && product.sale_price < product.price;
  const baseImages = product.images?.length ? product.images : [];
  const variantImgs = (product.variant_images || []).map((v) => v.image).filter(Boolean);
  const images = [...baseImages, ...variantImgs];
  const variantImageFor = (variant, option) =>
    (product.variant_images || []).find((v) => v.variant === variant && v.option === option)?.image;

  const variantStr = () => Object.values(selectedVariants).join(", ") || null;
  const handleAdd = () => addItem(product, qty, variantStr());
  const handleBuyNow = () => {
    addItem(product, qty, variantStr());
    navigate("/cart");
  };

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="container-bleed px-5 lg:px-10 py-5 border-b hairline">
        <nav className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* PDP main — sticky media stack + floating info */}
      <div className="container-bleed px-5 lg:px-10 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Media stack */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[80vh]">
          {images.length > 1 && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-20 lg:w-20 lg:h-24 shrink-0 overflow-hidden border-2 transition-colors ${activeImg === i ? "border-foreground" : "border-transparent opacity-60"}`}>
                  <Image src={img} alt="" className="w-full h-full object-cover" fittingType="fill" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 aspect-[3/4] overflow-hidden bg-secondary">
            {images[activeImg] && <Image src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" fittingType="fill" />}
          </div>
        </div>

        {/* Info module */}
        <div className="lg:py-4">
          {product.brand && <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-3">{product.brand}</p>}
          <h1 className="display-text text-4xl lg:text-5xl mb-4">{product.name}</h1>
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.rating) ? "fill-[#ff9f43] text-[#ff9f43]" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews_count || 0} reviews)</span>
            </div>
          )}
          {product.total_sales > 0 && (
            <p className="text-sm text-muted-foreground mb-6">Sales: ({product.total_sales})</p>
          )}
          <div className="flex items-baseline gap-3 mb-6">
            {hasSale ? (
              <>
                <span className="text-3xl font-bold text-accent">{formatPrice(product.sale_price)}</span>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock indicator — auto-updates from admin quantity */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              {product.stock > 0 && <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${product.stock > 0 ? "bg-green-500" : "bg-destructive"}`} />
            </span>
            {product.stock > 0 ? (
              <span className="text-sm font-medium text-green-600">In stock — {product.stock} available</span>
            ) : (
              <span className="text-sm font-medium text-destructive">Out of stock</span>
            )}
          </div>

          {product.short_description && <div className="serif-text text-lg text-muted-foreground leading-relaxed mb-8 max-w-prose whitespace-pre-line" dangerouslySetInnerHTML={{ __html: product.short_description }} />}

          {/* Variants */}
          {product.variants?.map((v) => {
            const isColor = /color/i.test(v.name || "");
            return (
              <div key={v.name} className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">{v.name}</p>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((opt) => {
                    const vImg = variantImageFor(v.name, opt);
                    const selected = selectedVariants[v.name] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedVariants((s) => ({ ...s, [v.name]: opt }));
                          if (vImg) {
                            const idx = images.indexOf(vImg);
                            if (idx >= 0) setActiveImg(idx);
                          }
                        }}
                        className={`flex items-center gap-2 pl-1 pr-3 py-1 text-sm border transition-colors ${selected ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                      >
                        {isColor && vImg && (
                          <img src={vImg} alt={opt} className="w-7 h-7 object-cover rounded" />
                        )}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Wishlist + Compare */}
          <div className="flex items-center gap-3 mb-6">
            <WishlistToggle productId={product.id} className="w-12 h-12 border hairline hover:border-red-400" />
            <button
              onClick={() => toggleCompare(product.id)}
              className={`btn-mono border px-5 ${hasCompare(product.id) ? "border-accent bg-accent text-white" : "border-foreground text-foreground hover:bg-foreground hover:text-background"}`}
            >
              <GitCompare className="w-4 h-4" /> {hasCompare(product.id) ? "In Compare" : "Compare"}
            </button>
          </div>

          {/* Qty + Add */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center border hairline">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-accent"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => (product.stock > 0 ? Math.min(product.stock, q + 1) : q))} className="p-3 hover:text-accent"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAdd} disabled={product.stock <= 0} className="btn-mono flex-1 min-w-[150px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock <= 0} className="btn-mono flex-1 min-w-[150px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Zap className="w-4 h-4" /> Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 border-t hairline pt-8 mb-10">
            {[
              { icon: Truck, label: "Free Shipping", sub: "Over $50" },
              { icon: RotateCcw, label: "30-Day Returns", sub: "No questions" },
              { icon: Shield, label: "2-Year Warranty", sub: "Full coverage" },
            ].map((t) => (
              <div key={t.label} className="text-center">
                <t.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="text-[11px] font-semibold uppercase tracking-wide">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.sub}</p>
              </div>
            ))}
          </div>

          {/* Shipping Options */}
          {product.shipping_options?.length > 0 && (
            <div className="border-t hairline pt-6 mb-10">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">Shipping Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.shipping_options.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 border hairline px-3 py-1.5 text-xs text-muted-foreground">
                    <Truck className="w-3.5 h-3.5 text-accent" /> {s.country} · {s.courier}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t hairline pt-8">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Description</h3>
              <div className="serif-text text-muted-foreground leading-relaxed max-w-prose whitespace-pre-line" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

        </div>
      </div>

      {/* Frequently Bought Together */}
      <FrequentlyBoughtTogether product={product} />

      {/* Customer Reviews — full width */}
      <section className="container-bleed px-5 lg:px-10 py-10 lg:py-16 border-t hairline">
        <CustomerReviews productId={product.id} productName={product.name} rating={product.rating} />
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24 border-t hairline">
          <h2 className="display-text text-3xl lg:text-4xl mb-10">Related Objects</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Floating buy bar */}
      {showBuyBar && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-16 z-40 bg-foreground text-background border-t border-white/10 animate-[fadeInUp_0.4s_ease]">
          <div className="container-bleed px-5 lg:px-10 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {images[0] && <Image src={images[0]} alt="" className="w-12 h-12 object-cover shrink-0" fittingType="fill" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{product.name}</p>
                <p className="text-xs text-background/60">{formatPrice(product.sale_price || product.price)}</p>
              </div>
            </div>
            <button onClick={handleAdd} disabled={product.stock <= 0} className="btn-mono bg-accent text-white hover:bg-white hover:text-foreground shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}