import { Link } from "react-router-dom";

const statusColor = (s) => ({
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}[s] || "bg-muted text-muted-foreground");

export default function ProfileOrders({ orders = [] }) {
  if (!orders.length) {
    return (
      <div className="border hairline p-10 text-center">
        <p className="serif-text text-muted-foreground mb-4">You have no orders yet.</p>
        <Link to="/shop" className="btn-mono-solid">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="border hairline p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleDateString()} · {o.items?.length || 0} item(s)</p>
            </div>
            <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${statusColor(o.status)}`}>{o.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${(o.total || 0).toFixed(2)}</span>
            <Link to={`/track?order=${o.order_number}`} className="text-sm text-accent hover:underline">Track →</Link>
          </div>
        </div>
      ))}
    </div>
  );
}