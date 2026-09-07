import { useWishlist } from "@/lib/wishlistContext";
import { Heart } from "lucide-react";

export default function WishlistToggle({ productId, className = "" }) {
  const { has, toggle } = useWishlist();
  const selected = has(productId);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(productId); }}
      className={`flex items-center justify-center transition-colors ${className}`}
      aria-label={selected ? "Remove from wishlist" : "Add to wishlist"}
      title={selected ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`w-5 h-5 ${selected ? "fill-red-500 text-red-500" : "text-foreground/70 hover:text-red-500"}`} />
    </button>
  );
}