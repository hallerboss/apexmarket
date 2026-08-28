import { Link } from "react-router-dom";
import { ChevronDown, MapPin, History, Package } from "lucide-react";
import AllCategoriesMenu from "@/components/store/AllCategoriesMenu";

const links = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop", chevron: true },
  { label: "Vendor", path: "/shop", chevron: true },
  { label: "Blog", path: "/page/blog" },
  { label: "Pages", path: "/page/about", chevron: true },
  { label: "Elements", path: "/shop" },
];

export default function CategoryNav() {
  return (
    <div className="bg-[#EFF4FB] border-t border-[#e0e8f2]">
      <div className="container-bleed px-5 lg:px-10 flex items-center justify-between gap-4 h-12">
        <div className="flex items-center gap-6">
          <AllCategoriesMenu />
          <nav className="hidden md:flex items-center gap-5 text-sm text-foreground">
            {links.map((l) => (
              <Link key={l.label} to={l.path} className="flex items-center gap-1 hover:text-accent transition-colors">
                {l.label}
                {l.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden lg:flex items-center gap-5 text-sm text-foreground">
          <Link to="/orders" className="flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-accent" />
            </span>
            My Orders
          </Link>
          <Link to="/track" className="flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-accent" />
            </span>
            Track Order
          </Link>
          <Link to="/shop" className="flex items-center gap-2 hover:text-accent transition-colors">
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