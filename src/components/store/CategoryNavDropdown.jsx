import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

function DropdownNode({ node }) {
  return (
    <div>
      <Link
        to={`/shop?category=${encodeURIComponent(node.name)}`}
        className="block px-4 py-2 text-sm text-[#333] hover:text-accent hover:bg-[#f5f9ff] transition-colors"
      >
        {node.name}
      </Link>
      {node.children.length > 0 && (
        <div className="ml-3 border-l border-[#eee]">
          {node.children.map((child) => (
            <DropdownNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryNavDropdown({ category }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={`/shop?category=${encodeURIComponent(category.name)}`}
        className="flex items-center gap-1 hover:text-accent transition-colors"
      >
        {category.name}
        <ChevronDown className="w-3.5 h-3.5" />
      </Link>
      {open && (
        <div className="absolute left-0 top-full pt-3 z-40">
          <div className="min-w-[220px] max-h-[70vh] overflow-y-auto bg-white border border-[#eee] shadow-xl py-2">
            {category.children.map((child) => (
              <DropdownNode key={child.id} node={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}