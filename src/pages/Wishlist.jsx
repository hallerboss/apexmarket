import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWishlist } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";
import { Image } from "@/components/ui/image";
import { Heart, Trash2, ShoppingBag, X } from "lucide-react";

export default function Wishlist() {
  const { ids, remove, clear } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    Promise.all(ids.map((id) => base44.entities.Product.get(id).catch(() => null)))
      .then((res) => setProducts(res.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="container-bleed px-5 lg:px-10 py-10 lg:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="display-text text-4xl lg:text-5xl">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-2">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
        </div>
        {products.length > 0 && (
          <button onClick={clear} className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-32 text-center"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center border hairline">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="serif-text text-xl mb-2">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-6">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn-mono-outline inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const inStock = (p.stock ?? 0) > 0;
            return (
              <div key={p.id} className="flex items-center gap-4 bg-card border hairline p-3">
                <Link to={`/product/${p.id}`} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-secondary overflow-hidden">
                  {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} className="w-full h-full" fittingType="fill" /> : <div className="w-full h-full" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p.id}`}><h3 className="text-sm font-medium line-clamp-2 hover:text-accent">{p.name}</h3></Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.brand}{p.brand && p.category ? " · " : ""}{p.category}</p>
                  <p className="text-sm font-bold mt-1">{formatPrice(p.sale_price || p.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => addItem(p)} disabled={!inStock} className="btn-mono bg-foreground text-background hover:bg-accent hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs px-4 py-2">
                    <ShoppingBag className="w-4 h-4" /> Add
                  </button>
                  <button onClick={() => remove(p.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}