import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, Phone, Scale, MapPin, Package, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { trackPageView } from "@/lib/analytics";
import StoreFooter from "@/components/store/StoreFooter";
import SearchBar from "@/components/store/SearchBar";
import CategoryNav from "@/components/store/CategoryNav";
import { base44 } from "@/api/base44Client";

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
  const [menuTab, setMenuTab] = useState("main");
  const [categories, setCategories] = useState([]);
  const [navSearch, setNavSearch] = useState("");
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    base44.entities.Category.list("order", 50).then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-white border-b border-[#eeeeee]">
        {/* top row */}
        <div className="container-bleed px-5 lg:px-10 flex items-center justify-between gap-4 h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-accent text-white flex items-center justify-center font-bold text-sm">w</span>
            <span className="text-xl sm:text-2xl font-semibold tracking-tight">wolmart</span>
          </Link>

          <div className="hidden sm:flex flex-1 justify-center px-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
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
            <button onClick={() => setSearchOpen(true)} className="sm:hidden p-1 hover:text-accent transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="relative hover:text-accent transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-1" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CategoryNav />

      </header>

      <main>
        <Outlet />
      </main>

      <StoreFooter />

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-[85%] max-w-sm h-full bg-[#1a1a1a] flex flex-col text-white">
            <div className="p-4 flex items-center gap-3 border-b border-white/10">
              <form
                onSubmit={(e) => { e.preventDefault(); if (navSearch.trim()) { navigate(`/shop?q=${encodeURIComponent(navSearch.trim())}`); setMenuOpen(false); } }}
                className="flex-1 flex items-center bg-white/10 rounded px-3 py-2"
              >
                <Search className="w-4 h-4 text-white/50" />
                <input value={navSearch} onChange={(e) => setNavSearch(e.target.value)} placeholder="Search" className="bg-transparent text-white text-sm ml-2 outline-none flex-1 placeholder:text-white/40" />
              </form>
              <button onClick={() => setMenuOpen(false)} className="p-1"><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="flex border-b border-white/10">
              <button onClick={() => setMenuTab("main")} className={`px-5 py-3 text-xs font-bold tracking-wide ${menuTab === "main" ? "text-white border-b-2 border-white" : "text-[#3b82f6]"}`}>MAIN MENU</button>
              <button onClick={() => setMenuTab("cat")} className={`px-5 py-3 text-xs font-bold tracking-wide ${menuTab === "cat" ? "text-white border-b-2 border-white" : "text-[#3b82f6]"}`}>CATEGORIES</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {menuTab === "main" ? (
                <>
                  {navLinks.map((l) => (
                    <Link key={l.label} to={l.path} onClick={() => setMenuOpen(false)} className="block px-5 py-4 text-base text-white border-b border-white/10 hover:bg-white/5">
                      {l.label}
                    </Link>
                  ))}
                  <Link to="/track" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 text-base text-white border-b border-white/10 hover:bg-white/5">
                    <MapPin className="w-4 h-4 text-[#3b82f6]" /> Track Order
                  </Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 text-base text-white border-b border-white/10 hover:bg-white/5">
                    <Package className="w-4 h-4 text-[#3b82f6]" /> My Orders
                  </Link>
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 text-base text-white border-b border-white/10 hover:bg-white/5">
                    <ShieldCheck className="w-4 h-4 text-[#3b82f6]" /> Admin Panel
                  </Link>
                </>
              ) : (
                <>
                  {categories.map((c) => (
                    <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setMenuOpen(false)} className="block px-5 py-4 text-base text-white border-b border-white/10 hover:bg-white/5">
                      {c.name}
                    </Link>
                  ))}
                  <Link to="/shop" onClick={() => setMenuOpen(false)} className="block px-5 py-4 text-base text-white font-semibold">View All Categories</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search popup (mobile) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:hidden">
          <div className="container-bleed px-5 flex items-center justify-between h-16 border-b hairline">
            <span className="text-lg font-semibold tracking-tight">Search</span>
            <button onClick={() => setSearchOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <div className="container-bleed px-5 py-6">
            <SearchBar autoFocus />
          </div>
        </div>
      )}
    </div>
  );
}