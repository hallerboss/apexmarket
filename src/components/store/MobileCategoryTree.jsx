import { Link } from "react-router-dom";
import { buildCategoryTree, categoryDescendants } from "@/lib/categoryTree";

export default function MobileCategoryTree({ categories = [], onNavigate }) {
  const tree = buildCategoryTree(categories);

  return (
    <>
      {tree.map((node) => (
        <div key={node.id}>
          <Link
            to={`/shop?category=${encodeURIComponent(node.name)}`}
            onClick={onNavigate}
            className="block px-5 py-3.5 text-base font-semibold text-white border-b border-white/10 hover:bg-white/5"
          >
            {node.name}
          </Link>
          {categoryDescendants(node).map((child) => (
            <Link
              key={child.id}
              to={`/shop?category=${encodeURIComponent(child.name)}`}
              onClick={onNavigate}
              className="block pl-8 pr-5 py-2.5 text-sm text-white/70 border-b border-white/10 hover:bg-white/5 hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      ))}
    </>
  );
}