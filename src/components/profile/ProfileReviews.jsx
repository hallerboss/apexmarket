import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const statusStyle = (s) => ({
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}[s] || "bg-yellow-100 text-yellow-700");

export default function ProfileReviews({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="border hairline p-10 text-center">
        <p className="serif-text text-muted-foreground mb-4">You haven't written any reviews yet.</p>
        <Link to="/orders" className="btn-mono-solid">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="border hairline p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link to={`/product/${r.product_id}`} className="text-sm font-medium hover:text-accent">{r.product_name || "Product"}</Link>
            <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${statusStyle(r.status)}`}>{r.status || "pending"}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-3.5 h-3.5 ${n <= (r.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          {r.title && <p className="text-sm font-semibold">{r.title}</p>}
          <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
          <p className="text-xs text-muted-foreground mt-3">{new Date(r.created_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}