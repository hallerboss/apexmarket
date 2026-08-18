import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { X, GitCompare } from "lucide-react";
import { useCompare } from "@/lib/compareContext";
import CompareModal from "@/components/store/CompareModal";

export default function CompareBar() {
  const { ids, remove, clear, count, max } = useCompare();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    Promise.all(ids.map((id) => base44.entities.Product.get(id)))
      .then(setProducts)
      .catch(() => {});
  }, [ids]);

  if (count === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-foreground text-background border-t border-white/10">
        <div className="container-bleed px-5 lg:px-10 py-3 flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold hidden sm:block whitespace-nowrap">
            Compare ({count}/{max})
          </span>
          <div className="flex items-center gap-3 flex-1 overflow-x-auto min-w-0">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-2 shrink-0">
                {p.images?.[0] && <Image src={p.images[0]} alt="" className="w-10 h-10 object-cover" fittingType="fill" />}
                <span className="text-xs font-medium truncate max-w-[120px] hidden sm:block">{p.name}</span>
                <button onClick={() => remove(p.id)} className="text-background/60 hover:text-background" aria-label="Remove">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={clear} className="text-[11px] uppercase tracking-[0.15em] text-background/60 hover:text-background whitespace-nowrap hidden sm:block">Clear</button>
            <button
              onClick={() => setOpen(true)}
              disabled={count < 2}
              className="btn-mono bg-accent text-white hover:bg-white hover:text-foreground disabled:opacity-40 whitespace-nowrap"
            >
              <GitCompare className="w-4 h-4" /> Compare
            </button>
          </div>
        </div>
      </div>
      {open && <CompareModal products={products} onClose={() => setOpen(false)} />}
    </>
  );
}