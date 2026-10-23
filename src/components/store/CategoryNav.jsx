import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MapPin, History, Package } from "lucide-react";
import AllCategoriesMenu from "@/components/store/AllCategoriesMenu";
import CategoryNavDropdown from "@/components/store/CategoryNavDropdown";
import { buildCategoryTree } from "@/lib/categoryTree";
import { useCategories } from "@/hooks/useCategories";

const links = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop", chevron: true },
  { label: "Vendor", path: "/shop", chevron: true },
  { label: "Blog", path: "/page/blog" },
  { label: "Track Order", path: "/track" },
  { label: "Pages", path: "/page/about", chevron: true },
  { label: "Elements", path: "/shop" },
];

export default function CategoryNav() {
  const { categories: cats } = useCategories();

  const dropdowns = buildCategoryTree(cats).filter((c) => c.children.length > 0);

  return (
    <div className="bg-[#EFF4FB] border-t border-[#e0e8f2]">
      <div className="container-bleed px-5 lg:px-10 flex items-center justify-between gap-4 h-12">
        <div className="flex items-center gap-6">
          <AllCategoriesMenu />
          <nav className="hidden md:flex items-center gap-5 text-sm text-foreground">
            {links.slice(0, 2).map((l) => (
              <Link key={l.label} to={l.path} className="flex items-center gap-1 hover:text-accent transition-colors">
                {l.label}
                {l.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ))}
            {dropdowns.map((c) => (
              <CategoryNavDropdown key={c.id} category={c} />
            ))}
            {links.slice(2).map((l) => (
              <Link key={l.label} to={l.path} className="flex items-center gap-1 hover:text-accent transition-colors">
                {l.label}
                {l.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 text-sm text-foreground">
          <Link to="/orders" className="hidden lg:flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-accent" />
            </span>
            My Orders
          </Link>
          <Link to="/track" className="hidden lg:flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-accent" />
            </span>
            Track Order
          </Link>
          <Link to="/shop" className="hidden lg:flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-accent" />
            </span>
            Recently Viewed <ChevronDown className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}