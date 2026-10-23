import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { buildCategoryTree } from "@/lib/categoryTree";

function CategoryNode({ node, onNavigate, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-center border-b border-white/10">
        <Link
          to={`/shop?category=${encodeURIComponent(node.name)}`}
          onClick={onNavigate}
          className={`flex-1 py-3.5 text-white hover:bg-white/5 ${
            depth === 0 ? "pl-5 text-base font-semibold" : "pl-8 text-sm font-normal text-white/80"
          }`}
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={`Show ${node.name} subcategories`}
            className="px-4 py-3.5 text-white/60 hover:text-white"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
      {open && hasChildren && (
        <div className="bg-white/5">
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} onNavigate={onNavigate} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileCategoryTree({ categories = [], onNavigate }) {
  const tree = buildCategoryTree(categories);

  return (
    <>
      {tree.map((node) => (
        <CategoryNode key={node.id} node={node} onNavigate={onNavigate} />
      ))}
    </>
  );
}