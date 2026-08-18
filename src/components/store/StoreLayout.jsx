import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { trackPageView } from "@/lib/analytics";
import StoreFooter from "@/components/store/StoreFooter";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Electronics", path: "/shop?category=Electronics" },
  { label: "Fashion", path: "/shop?category=Fashion" },
  { label: "Furniture", path: "/shop?category=Furniture" },
  { label: "About", path: "/page/about" },
];

export default function StoreLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Monolith sidebar — desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center justify-between py-8 z-40 border-r hairline bg-background">
        <Link to="/" className="display-text text-xl">W</Link>
        <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Wolmart · Est. 2024
        </div>
      </aside>

      {/* Top bar */}
      <div className="flex-1 lg:ml-16">
        <header className={`sticky top-0 z-30 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-md border-b hairline" : "bg-transparent"}`}>
          <div className="container-bleed px-5 lg:px-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="display-text text-2xl lg:hidden">WOLMART</Link>
              <nav className="hidden lg:flex items-center gap-7">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.path}
                    className="text-[12px] uppercase tracking-[0.15em] font-medium hover:text-accent transition-colors relative group"
                  >
                    {l.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2.5 hover:text-accent transition-colors" aria-label="Search">
                <Search className="w-[18px] h-[18px]" />
              </button>
              <Link to="/admin" className="p-2.5 hover:text-accent transition-colors hidden sm:block" aria-label="Admin">
                <User className="w-[18px] h-[18px]" />
              </Link>
              <Link to="/cart" className="p-2.5 hover:text-accent transition-colors relative" aria-label="Cart">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(true)} className="p-2.5" aria-label="Menu">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Search overlay */}
          {searchOpen && (
            <div className="border-t hairline bg-background">
              <div className="container-bleed px-5 lg:px-10 py-6">
                <div className="flex items-center gap-3 border-b hairline pb-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Search the archive…"
                    className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/shop?q=${e.target.value}`; }}
                  />
                  <button onClick={() => setSearchOpen(false)}><X className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>
          <Outlet />
        </main>

        <StoreFooter />
      </div>

      {/* Full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col">
          <div className="container-bleed px-5 lg:px-10 flex items-center justify-between h-16 border-b hairline">
            <span className="display-text text-xl">WOLMART</span>
            <button onClick={() => setMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row">
            <nav className="flex-1 flex flex-col justify-center px-5 lg:px-20 gap-2 lg:gap-4">
              {navLinks.map((l, i) => (
                <Link
                  key={l.label}
                  to={l.path}
                  className="display-text text-4xl lg:text-7xl hover:text-accent transition-colors duration-300"
                  style={{ animation: `fadeInUp 0.5s ease ${i * 0.05}s both` }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="lg:w-96 border-l hairline p-5 lg:p-10 flex flex-col justify-end gap-4 text-sm text-muted-foreground">
              <p className="serif-text text-base text-foreground">A high-fidelity retail ecosystem for curated discovery.</p>
              <p>hello@wolmart.studio</p>
              <p>+1 (555) 028-2024</p>
              <Link to="/admin" className="text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-accent mt-4">Admin Panel →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}