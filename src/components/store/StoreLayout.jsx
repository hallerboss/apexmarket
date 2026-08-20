import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, Phone, Scale } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { trackPageView } from "@/lib/analytics";
import StoreFooter from "@/components/store/StoreFooter";
import SearchBar from "@/components/store/SearchBar";
import CategoryNav from "@/components/store/CategoryNav";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Electronics", path: "/shop?category=Electronics" },
  { label: "Fashion", path: "/shop?category=Fashion" },
  { label: "Furniture", path: "/shop?category=Furniture" },
  { label: "About", path: "/page/about" },
];

export default function StoreLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count } = useCart();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-white border-b border-[#eeeeee]">
        {/* top row */}
        <div className="container-bleed px-5 lg:px-10 flex items-center justify-between gap-4 h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-md bg-accent text-white flex items-center justify-center font-bold">w</span>
            <span className="text-2xl font-semibold tracking-tight">wolmart</span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center px-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            <div className="hidden lg:flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent" />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Call Us Now:</p>
                <p className="text-sm font-bold text-foreground">0(800)123-456</p>
              </div>
            </div>
            <Link to="/shop" className="hidden md:block hover:text-accent transition-colors" aria-label="Compare">
              <Scale className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="relative hover:text-accent transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setSearchOpen((v) => !v)} className="md:hidden p-1" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-1" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CategoryNav />

        {searchOpen && (
          <div className="md:hidden border-t border-[#eeeeee] bg-white">
            <div className="container-bleed px-5 py-4">
              <SearchBar />
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <StoreFooter />

      {/* Full-screen menu overlay (mobile) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="container-bleed px-5 lg:px-10 flex items-center justify-between h-16 border-b hairline">
            <span className="text-xl font-normal tracking-tight">WOLMART</span>
            <button onClick={() => setMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex-1 flex flex-col justify-center px-5 lg:px-20 gap-3 lg:gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.path}
                className="text-3xl lg:text-6xl font-normal hover:text-accent transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="p-5 lg:p-10 border-t hairline text-sm text-muted-foreground space-y-1">
            <p className="text-foreground">A high-fidelity retail ecosystem for curated discovery.</p>
            <p>hello@wolmart.studio</p>
            <p>+1 (555) 028-2024</p>
            <Link to="/admin" className="inline-block text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-accent mt-3">
              Admin Panel →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}