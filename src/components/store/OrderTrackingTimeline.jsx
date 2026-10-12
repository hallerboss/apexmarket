import { TRACKING_STAGES, stageIndex, stageLabel } from "@/lib/orderTracking";

export default function OrderTrackingTimeline({ history = [], currentStatus, trackingNumber, carrier }) {
  const reached = stageIndex(currentStatus);
  const byStatus = {};
  for (const h of history) {
    byStatus[h.status] = h;
  }
  const fmt = (ts) => {
    try { return new Date(ts).toLocaleString(); } catch { return ""; }
  };

  return (
    <div className="rounded-xl border border-[#eee] p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-base font-bold text-black">{stageLabel(currentStatus)}</p>
        {carrier && <span className="text-xs text-[#808080]">{carrier}</span>}
      </div>
      {trackingNumber && (
        <p className="text-sm text-[#808080] mb-4">Tracking number: <span className="text-black font-medium">{trackingNumber}</span></p>
      )}

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#e0e0e0]" />
        {TRACKING_STAGES.map((s, i) => {
          const done = i <= reached;
          const isCurrent = i === reached;
          const entry = byStatus[s.key];
          return (
            <div key={s.key} className="relative mb-5 last:mb-0">
              <span
                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${done ? "bg-[#16a34a]" : "bg-[#d8d8d8]"}`}
              />
              <p className={`text-sm ${done ? "font-semibold text-black" : "text-[#9a9a9a]"} ${isCurrent ? "" : ""}`}>{s.label}</p>
              {entry && <p className="text-xs text-[#808080]">{fmt(entry.timestamp)}</p>}
              {entry?.note && <p className="text-xs text-[#666] mt-0.5">{entry.note}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}