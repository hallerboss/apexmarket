import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Package, ShoppingCart, Star, FolderTree, TrendingUp, DollarSign, Clock, AlertTriangle } from "lucide-react";
import LowStockAlerts from "@/components/admin/LowStockAlerts";
import AnalyticsOverview from "@/components/admin/AnalyticsOverview";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, reviews: 0, pendingReviews: 0, categories: 0, revenue: 0, pendingOrders: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list("-created_date", 500),
      base44.entities.Order.list("-created_date", 500),
      base44.entities.Review.list("-created_date", 500),
      base44.entities.Category.list("-created_date", 500),
    ]).then(([prods, orders, revs, cats]) => {
      const pendingReviews = revs.filter((r) => r.status === "pending").length;
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      const totalStock = prods.reduce((s, p) => s + (p.stock || 0), 0);
      const lowStock = prods.filter((p) => (p.stock || 0) <= 5).length;
      setStats({
        products: prods.length,
        orders: orders.length,
        reviews: revs.length,
        pendingReviews,
        categories: cats.length,
        revenue,
        pendingOrders,
        totalStock,
        lowStock,
      });
      setProducts(prods);
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign },
    { label: "Products", value: stats.products, icon: Package, link: "/admin/products" },
    { label: "Orders", value: stats.orders, icon: ShoppingCart, link: "/admin/orders" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock },
    { label: "Reviews", value: stats.reviews, icon: Star, link: "/admin/reviews" },
    { label: "Pending Reviews", value: stats.pendingReviews, icon: Star, link: "/admin/reviews" },
    { label: "Categories", value: stats.categories, icon: FolderTree, link: "/admin/categories" },
    { label: "Total Stock", value: stats.totalStock, icon: Package, link: "/admin/products" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, link: "/admin/products" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="display-text text-3xl">Dashboard</h2>
        <p className="text-sm text-black/50 mt-1">High-velocity overview of your retail ecosystem.</p>
      </div>

      {/* Stat grid — 2-column white cards */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((s) => {
          const Card = (
            <div className="bg-white border border-[#e5e7eb] p-5 hover:border-black/20 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <s.icon className="w-5 h-5 text-black" />
                <span className="text-2xl font-bold text-black">{s.value}</span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-black/50">{s.label}</p>
            </div>
          );
          return s.link ? <Link key={s.label} to={s.link}>{Card}</Link> : <div key={s.label}>{Card}</div>;
        })}
      </div>

      {/* Low stock alerts + analytics */}
      <div className="grid lg:grid-cols-2 gap-4">
        <LowStockAlerts products={products} />
        <AnalyticsOverview />
      </div>

      {/* Recent orders */}
      <div className="bg-[#0a0a0a] border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Orders</h3>
          <Link to="/admin/orders" className="text-[11px] uppercase tracking-[0.15em] text-accent hover:underline">View All</Link>
        </div>
        {loading ? (
          <div className="p-12 text-center text-white/30 text-sm">Loading…</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No orders yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((o) => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{o.order_number} · {o.customer_name}</p>
                  <p className="text-xs text-white/40">{o.items?.length || 0} items · {new Date(o.created_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold">${(o.total || 0).toFixed(2)}</span>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-1 ${
                    o.status === "delivered" ? "bg-green-500/10 text-green-400" :
                    o.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                    o.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Add Product", link: "/admin/products?new=1", desc: "Upload a new object" },
          { label: "Create Category", link: "/admin/categories", desc: "Add a product category" },
          { label: "Create Page", link: "/admin/pages?new=1", desc: "Publish a CMS page" },
          { label: "Approve Reviews", link: "/admin/reviews", desc: `${stats.pendingReviews} pending` },
        ].map((a) => (
          <Link key={a.label} to={a.link} className="bg-[#0a0a0a] border border-white/5 p-6 hover:border-accent/40 transition-colors group">
            <h4 className="text-base font-semibold text-white group-hover:text-accent transition-colors">{a.label}</h4>
            <p className="text-sm text-white/40 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}