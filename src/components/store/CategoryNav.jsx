import { useState } from "react";
import { Link } from "react-router-dom";
import { List, ChevronDown, MapPin, History } from "lucide-react";
import { base44 } from "@/api/base44Client";

const links = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop", chevron: true },
  { label: "Vendor", path: "/shop", chevron: true },
  { label: "Blog", path: "/page/blog" },
  { label: "Pages", path: "/page/about", chevron: true },
  { label: "Elements", path: "/shop" },
];

export default function CategoryNav() {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]);

  const toggle = () => {
    if (!open && cats.length === 0) base44.entities.Category.list().then(setCats).catch(() => {});
    setOpen(!open);
  };

  return (
    <div className="bg-[#EFF4FB] border-t border-[#e0e8f2]">
      <div className="container-bleed px-5 lg:px-10 flex items-center justify-between gap-4 h-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={toggle}
              className="h-10 px-4 flex items-center gap-2 bg-accent text-white text-sm font-semibold rounded-md hover:opacity-90"
            >
              <List className="w-4 h-4" /> All Categories <ChevronDown className="w-4 h-4" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute left-0 top-12 z-20 w-60 max-h-80 overflow-auto bg-white border border-[#eeeeee] shadow-lg py-1">
                  {cats.length === 0 && <div className="px-4 py-2 text-sm text-muted-foreground">Loading…</div>}
                  {cats.map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${encodeURIComponent(c.name)}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-muted hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
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
          <Link to="/page/track-order" className="flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-accent" /></span>
            Track Order
          </Link>
          <Link to="/shop" className="flex items-center gap-2 hover:text-accent transition-colors">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><History className="w-3.5 h-3.5 text-accent" /></span>
            Recently Viewed <ChevronDown className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}