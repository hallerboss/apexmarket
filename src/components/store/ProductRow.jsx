import ProductCard from "@/components/store/ProductCard";

export default function ProductRow({ products = [] }) {
  if (!products.length) return null;
  return (
    <div className="flex lg:grid lg:grid-cols-6 gap-4 lg:gap-5 overflow-x-auto pb-6 lg:pb-0 -mx-5 px-5 lg:mx-0 lg:px-0">
      {products.map((p, i) => (
        <div key={p.id} className="w-[150px] sm:w-[170px] shrink-0 lg:w-auto">
          <ProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}