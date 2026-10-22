import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download } from "lucide-react";

const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const HEADERS = [
  "Order Number", "Date", "Customer", "Email", "Phone", "Status", "Payment Method",
  "Items", "Subtotal", "Shipping", "Total", "Tracking Number", "Carrier",
];

export default function ExportOrdersButton({ variant = "light" }) {
  const [exporting, setExporting] = useState(false);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const orders = await base44.entities.Order.list("-created_date", 1000);
      const rows = orders.map((o) => [
        o.order_number,
        o.created_date ? new Date(o.created_date).toISOString().slice(0, 10) : "",
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.status,
        o.payment_method,
        (o.items || []).map((i) => `${i.name} x${i.quantity || 1}`).join(" | "),
        (o.subtotal || 0).toFixed(2),
        (o.shipping || 0).toFixed(2),
        (o.total || 0).toFixed(2),
        o.tracking_number,
        o.carrier,
      ]);
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      const csv = [
        HEADERS.map(escape).join(","),
        ...rows.map((r) => r.map(escape).join(",")),
        "",
        ["TOTAL REVENUE", "", "", "", "", "", "", `${orders.length} orders`, "", "", revenue.toFixed(2), "", ""].map(escape).join(","),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={exportCsv}
      disabled={exporting}
      className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50 flex items-center gap-2 ${
        variant === "dark" ? "bg-accent text-white hover:bg-accent/90" : "bg-black text-white hover:bg-black/80"
      }`}
    >
      <Download className="w-4 h-4" /> {exporting ? "Exporting…" : "Export Orders CSV"}
    </button>
  );
}