import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Star, FileText, ShoppingCart,
  Image as ImageIcon, Settings, ArrowLeft, Menu, X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Categories", path: "/admin/categories", icon: FolderTree },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Pages", path: "/admin/pages", icon: FileText },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Banners", path: "/admin/banners", icon: ImageIcon },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => (path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path));

  const Sidebar = (
    <aside className="w-60 shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/5">
        <Link to="/admin" className="display-text text-xl text-white">WOLMART</Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1">Command Center</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors relative ${
                active ? "text-white bg-white/5" : "text-white/50 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />}
              <item.icon className="w-[18px] h-[18px]" />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <Link to="/" className="flex items-center gap-3 px-2 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex sticky top-0 h-screen">{Sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur border-b border-white/5 px-5 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-white/60"><Menu className="w-5 h-5" /></button>
            <h1 className="text-sm font-semibold capitalize">
              {navItems.find((n) => isActive(n.path))?.label || "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-white/40 hidden sm:block" aria-live="polite">System Online</span>
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">A</div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}