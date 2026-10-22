import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { buildCategoryTree } from "@/lib/categoryTree";

function TreeNode({ node, onNavigate }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-center border-b border-white/10">
        <Link
          to={`/shop?category=${encodeURIComponent(node.name)}`}
          onClick={onNavigate}
          className="flex-1 px-5 py-3.5 text-base text-white hover:bg-white/5"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="px-4 py-3.5 text-white/60 hover:text-white"
            aria-label={`Show subcategories of ${node.name}`}
          >
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>
      {open && hasChildren && (
        <div className="ml-4 border-l border-white/10">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onNavigate={onNavigate} />
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
        <TreeNode key={node.id} node={node} onNavigate={onNavigate} />
      ))}
    </>
  );
}