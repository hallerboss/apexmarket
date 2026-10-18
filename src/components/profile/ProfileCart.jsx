import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { Image } from "@/components/ui/image";

export default function ProfileCart() {
  const { items, removeItem, subtotal, count } = useCart();

  if (!items.length) {
    return (
      <div className="border hairline p-10 text-center">
        <p className="serif-text text-muted-foreground mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-mono-solid">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="border hairline divide-y divide-border">
      {items.map((i) => (
        <div key={i.key} className="flex items-center gap-4 p-4">
          <Link to={`/product/${i.product_id}`} className="w-16 h-20 bg-secondary shrink-0 overflow-hidden block">
            <Image src={i.image} alt={i.name} className="w-full h-full" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/product/${i.product_id}`} className="text-sm font-medium hover:text-accent line-clamp-2">{i.name}</Link>
            <p className="text-xs text-muted-foreground mt-1">Qty {i.quantity}{i.variant ? ` · ${i.variant}` : ""}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">${(i.price * i.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(i.key)} className="text-[11px] text-muted-foreground hover:text-destructive mt-1 flex items-center gap-1 ml-auto">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ))}
      <div className="p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Subtotal ({count} item{count === 1 ? "" : "s"})</span>
        <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
      </div>
      <div className="p-4">
        <Link to="/cart" className="btn-mono-solid w-full">Go to Cart</Link>
      </div>
    </div>
  );
}