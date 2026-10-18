import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const DAYS = 30;

// Turn sparse daily buckets from the server into a dense 30-day window
const buildDays = (series) => {
  const map = new Map();
  (series || []).forEach((point) => {
    const key = String(point.date || "").slice(0, 10);
    if (key) map.set(key, (map.get(key) || 0) + Number(point.count || 0));
  });

  const now = new Date();
  const out = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push({ label: `${key.slice(8)}/${key.slice(5, 7)}`, value: map.get(key) || 0 });
  }
  return out;
};

export default function TrafficChart({ title, series, color = "#2563eb" }) {
  const data = buildDays(series);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const gradientId = `traffic-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50">{title}</p>
        <p className="text-[10px] text-black/40">{total.toLocaleString()} in the last 30 days</p>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eef0f2" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={5} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 2 }}
              formatter={(value) => [value, "visitors"]}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}