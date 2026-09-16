import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/store/ProductCard";

const COL_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export default function BlockProductGrid({ category, limit = 4, columns = 4 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const query = category ? { category } : {};
    base44.entities.Product.filter(query, "-created_date", limit)
      .then(setItems)
      .catch(() => setItems([]));
  }, [category, limit]);

  if (!items.length) return null;

  return (
    <div className={`grid ${COL_CLASS[columns] || COL_CLASS[4]} gap-4 lg:gap-6`}>
      {items.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}