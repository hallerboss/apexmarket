import { useCompare } from "@/lib/compareContext";
import { GitCompare, Check } from "lucide-react";

export default function CompareToggle({ productId }) {
  const { has, toggle } = useCompare();
  const selected = has(productId);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(productId); }}
      className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center border transition-colors ${
        selected ? "bg-accent text-white border-accent" : "bg-background/90 text-foreground border-hairline hover:border-accent"
      }`}
      aria-label={selected ? "Remove from compare" : "Add to compare"}
      title={selected ? "Remove from compare" : "Add to compare"}
    >
      {selected ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
    </button>
  );
}