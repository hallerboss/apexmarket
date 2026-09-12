import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Star, FileText, ShoppingCart,
  Image as ImageIcon, Settings, ArrowLeft, Film, CreditCard, Newspaper,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Categories", path: "/admin/categories", icon: FolderTree },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Pages", path: "/admin/pages", icon: FileText },
  { label: "Blog", path: "/admin/blog", icon: Newspaper },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Banners", path: "/admin/banners", icon: ImageIcon },
  { label: "Media", path: "/admin/media", icon: Film },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-foreground flex flex-col">
      {/* Top nav bar (replaces left sidebar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-black/10">
        <div className="px-4 lg:px-8 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin" className="display-text text-xl text-black">WOLMART</Link>
            <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 hidden xl:block">Command Center</span>
          </div>

          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 min-w-0 justify-center">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors relative ${
                    active ? "text-black" : "text-black/50 hover:text-black"
                  }`}
                >
                  {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 bg-accent" />}
                  <item.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Store</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-xs font-bold text-black">A</div>
          </div>
        </div>
      </header>

      <main className="admin-main flex-1 p-5 lg:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}