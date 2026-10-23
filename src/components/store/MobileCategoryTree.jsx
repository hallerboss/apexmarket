import { Link } from "react-router-dom";
import { buildCategoryTree } from "@/lib/categoryTree";

// Mobile menu: only the main categories are listed — subcategories stay hidden.
export default function MobileCategoryTree({ categories = [], onNavigate }) {
  const tree = buildCategoryTree(categories);

  return (
    <>
      {tree.map((node) => (
        <Link
          key={node.id}
          to={`/shop?category=${encodeURIComponent(node.name)}`}
          onClick={onNavigate}
          className="block px-5 py-3.5 text-base font-semibold text-white border-b border-white/10 hover:bg-white/5"
        >
          {node.name}
        </Link>
      ))}
    </>
  );
}