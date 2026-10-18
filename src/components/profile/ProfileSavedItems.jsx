import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWishlist } from "@/lib/wishlistContext";
import { Image } from "@/components/ui/image";
import { Heart, X } from "lucide-react";

const asList = (p) => (Array.isArray(p) ? p : p?.items || []);

export default function ProfileSavedItems() {
  const { ids, remove } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    base44.entities.Product
      .filter({ id: { $in: ids } }, { limit: 50 })
      .then((p) => setProducts(asList(p)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids.join(",")]);

  if (loading) {
    return <div className="py-16 text-center"><div className="w-7 h-7 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>;
  }

  if (!products.length) {
    return (
      <div className="border hairline p-10 text-center">
        <Heart className="w-8 h-8 mx-auto text-muted-foreground/40 mb-4" />
        <p className="serif-text text-muted-foreground mb-4">You haven't saved any items yet.</p>
        <Link to="/shop" className="btn-mono-solid">Find Something</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((p) => (
        <div key={p.id} className="border hairline group relative">
          <Link to={`/product/${p.id}`} className="block aspect-[3/4] bg-secondary overflow-hidden">
            <Image src={p.images?.[0]} alt={p.name} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
          </Link>
          <button
            onClick={() => remove(p.id)}
            aria-label="Remove from saved items"
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 flex items-center justify-center hover:bg-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="p-3">
            <Link to={`/product/${p.id}`} className="text-sm font-medium hover:text-accent line-clamp-2">{p.name}</Link>
            <p className="text-sm font-bold mt-1">${(p.sale_price || p.price || 0).toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}