import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Star, Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield, ImagePlus } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { trackProductView } from "@/lib/analytics";
import ProductCard from "@/components/store/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [showBuyBar, setShowBuyBar] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: "", email: "", rating: 5, title: "", comment: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewMedia, setReviewMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => base44.integrations.Core.UploadFile({ file: f })));
      setReviewMedia((cur) => [...cur, ...uploaded.map((u) => u.file_url)]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.Product.get(id),
      base44.entities.Review.filter({ product_id: id, status: "approved" }),
    ]).then(([p, revs]) => {
      setProduct(p);
      setReviews(revs);
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
  const images = product.images?.length ? product.images : [];

  const handleAdd = () => {
    const variantStr = Object.values(selectedVariants).join(", ") || null;
    addItem(product, qty, variantStr);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await base44.functions.invoke("submitReview", {
        product_id: product.id,
        product_name: product.name,
        author: reviewForm.author,
        email: reviewForm.email,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        media: reviewMedia,
      });
      base44.entities.Review.filter({ product_id: id, status: "approved" }).then(setReviews);
      setReviewSubmitted(true);
      setReviewForm({ author: "", email: "", rating: 5, title: "", comment: "" });
      setReviewMedia([]);
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Failed to submit review");
    }
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
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.rating) ? "fill-foreground text-foreground" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews_count || reviews.length} reviews)</span>
            </div>
          )}
          <div className="flex items-baseline gap-3 mb-6">
            {hasSale ? (
              <>
                <span className="text-3xl font-bold text-accent">${product.sale_price.toFixed(2)}</span>
                <span className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
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

          {product.short_description && <p className="serif-text text-lg text-muted-foreground leading-relaxed mb-8 max-w-prose">{product.short_description}</p>}

          {/* Variants */}
          {product.variants?.map((v) => (
            <div key={v.name} className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">{v.name}</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariants((s) => ({ ...s, [v.name]: opt }))}
                    className={`px-4 py-2.5 text-sm border transition-colors ${selectedVariants[v.name] === opt ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Qty + Add */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border hairline">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-accent"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => (product.stock > 0 ? Math.min(product.stock, q + 1) : q))} className="p-3 hover:text-accent"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAdd} disabled={product.stock <= 0} className="btn-mono-solid flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
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

          {/* Description */}
          {product.description && (
            <div className="border-t hairline pt-8">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">Description</h3>
              <div className="serif-text text-muted-foreground leading-relaxed max-w-prose whitespace-pre-line">{product.description}</div>
            </div>
          )}

          {/* Reviews */}
          <div className="border-t hairline pt-8 mt-10">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-6">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="serif-text text-muted-foreground mb-6">No reviews yet. Be the first.</p>
            ) : (
              <div className="space-y-6 mb-8">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b hairline pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground shrink-0">{(r.author || "?")[0]?.toUpperCase()}</div>
                      )}
                      <div>
                        <span className="text-sm font-semibold block">{r.author}</span>
                        <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-foreground text-foreground" : "text-muted-foreground/40"}`} />)}</div>
                      </div>
                    </div>
                    {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                    <p className="serif-text text-muted-foreground text-sm">{r.comment}</p>
                    {r.media?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.media.map((url, mi) => (
                          <a key={mi} href={url} target="_blank" rel="noreferrer" className="block w-16 h-16 overflow-hidden bg-secondary">
                            {url.match(/\.(mp4|mov|webm)$/i) ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <Image src={url} alt="" className="w-full h-full object-cover" fittingType="fill" />
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review form */}
            {reviewSubmitted ? (
              <div className="bg-secondary p-6 text-center">
                <p className="serif-text text-lg">Thank you. Your review is now live.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold">Write a Review</p>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Your name" value={reviewForm.author} onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })} className="border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none" />
                  <input required type="email" placeholder="Email" value={reviewForm.email} onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })} className="border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      <Star className={`w-5 h-5 ${n <= reviewForm.rating ? "fill-foreground text-foreground" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
                <input placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none" />
                <textarea required placeholder="Your review…" rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none resize-none" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">Add Photo / Video</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm border hairline px-4 py-2.5 cursor-pointer hover:border-accent inline-flex items-center gap-2">
                      <ImagePlus className="w-4 h-4" /> Upload
                      <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} className="hidden" disabled={uploading} />
                    </label>
                    {uploading && <span className="text-sm text-muted-foreground">Uploading…</span>}
                    {reviewMedia.map((url, mi) => (
                      <div key={mi} className="relative w-14 h-14 overflow-hidden bg-secondary">
                        {url.match(/\.(mp4|mov|webm)$/i) ? <video src={url} className="w-full h-full object-cover" /> : <Image src={url} alt="" className="w-full h-full object-cover" fittingType="fill" />}
                        <button type="button" onClick={() => setReviewMedia((c) => c.filter((_, i) => i !== mi))} className="absolute top-0 right-0 bg-foreground text-background w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-mono-solid">Submit Review</button>
              </form>
            )}
          </div>
        </div>
      </div>

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
                <p className="text-xs text-background/60">${(product.sale_price || product.price).toFixed(2)}</p>
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