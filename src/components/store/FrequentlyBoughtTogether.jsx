import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Plus, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";

export default function FrequentlyBoughtTogether({ product }) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [related, setRelated] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!product?.id) return;
    base44.entities.Product.filter({ category: product.category }, "-rating", 6)
      .then((items) => {
        const filtered = items.filter((i) => i.id !== product.id).slice(0, 3);
        setRelated(filtered);
        const sel = {};
        filtered.forEach((f) => (sel[f.id] = true));
        setSelected(sel);
      })
      .catch(() => {});
  }, [product?.id, product?.category]);

  if (related.length === 0) return null;

  const selectedItems = related.filter((r) => selected[r.id]);
  const basePrice = product.sale_price || product.price;
  const total = selectedItems.reduce((sum, r) => sum + (r.sale_price || r.price), 0) + basePrice;

  const addAll = () => {
    addItem(product, 1);
    selectedItems.forEach((r) => addItem(r, 1));
  };

  return (
    <section className="container-bleed px-5 lg:px-10 py-10 lg:py-16 border-t hairline">
      <h2 className="display-text text-2xl lg:text-3xl mb-8">Frequently Bought Together</h2>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Product image chain */}
        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
          <Link to={`/product/${product.id}`} className="w-24 h-24 lg:w-28 lg:h-28 shrink-0 overflow-hidden bg-secondary border hairline">
            {product.images?.[0] && <Image src={product.images[0]} alt={product.name} className="w-full h-full object-cover" fittingType="fill" />}
          </Link>
          {related.map((r) => (
            <div key={r.id} className="flex items-center gap-2 lg:gap-3">
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
              <Link to={`/product/${r.id}`} className="w-24 h-24 lg:w-28 lg:h-28 shrink-0 overflow-hidden bg-secondary border hairline">
                {r.images?.[0] && <Image src={r.images[0]} alt={r.name} className="w-full h-full object-cover" fittingType="fill" />}
              </Link>
            </div>
          ))}
        </div>

        {/* Selection list + total */}
        <div className="flex-1">
          <div className="space-y-3 mb-6">
            {related.map((r) => (
              <label key={r.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selected[r.id]}
                  onChange={() => setSelected((s) => ({ ...s, [r.id]: !s[r.id] }))}
                  className="w-4 h-4 accent-accent"
                />
                <Link to={`/product/${r.id}`} className="text-sm hover:text-accent line-clamp-1 flex-1">{r.name}</Link>
                <span className="text-sm font-medium">{formatPrice(r.sale_price || r.price)}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Total for {selectedItems.length + 1} items</p>
              <p className="text-2xl font-bold">{formatPrice(total)}</p>
            </div>
            <button onClick={addAll} className="btn-mono-solid">
              <ShoppingBag className="w-4 h-4" /> Add All to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}