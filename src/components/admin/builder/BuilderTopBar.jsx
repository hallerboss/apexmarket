import { Link } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Layers, Monitor, Tablet, Smartphone, Eye, Loader2 } from "lucide-react";

const DEVICES = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export default function BuilderTopBar({
  title, onTitleChange, status,
  onNew, device, onDevice, showWidgets, onToggleWidgets,
  slug, onSave, saving, saved,
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#e5e7eb] px-3 h-12 mb-4">
      <Link to="/admin/pages" className="p-2 text-[#6b7280] hover:text-black transition-colors" title="Exit to pages">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <button type="button" onClick={onNew} className="p-2 text-[#6b7280] hover:text-black transition-colors" title="New page">
        <Plus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onToggleWidgets}
        className={`p-2 transition-colors ${showWidgets ? "text-accent" : "text-[#6b7280] hover:text-black"}`}
        title="Toggle widget panel"
      >
        <Layers className="w-4 h-4" />
      </button>
      <span className="p-2 text-[#c4c8cf]" title="Page settings are on the right">
        <FileText className="w-4 h-4" />
      </span>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled page"
          className="text-sm font-medium text-center bg-transparent outline-none min-w-0 w-56 truncate"
        />
        <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 shrink-0 ${status === "published" ? "bg-green-100 text-green-700" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
          {status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      <div className="flex items-center gap-0.5 border border-[#e5e7eb] p-0.5">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onDevice(d.id)}
              title={d.label}
              className={`p-1.5 transition-colors ${device === d.id ? "bg-[#f3f4f6] text-black" : "text-[#9ca3af] hover:text-black"}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {slug ? (
        <Link to={`/page/${slug}`} target="_blank" className="p-2 text-[#6b7280] hover:text-black transition-colors" title="Preview page">
          <Eye className="w-4 h-4" />
        </Link>
      ) : (
        <span className="p-2 text-[#c4c8cf]" title="Save the page to preview it">
          <Eye className="w-4 h-4" />
        </span>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="bg-[#ffb3e6] text-[#1a1a1c] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-[#ff9ade] disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saved ? "Saved" : "Publish"}
      </button>
    </div>
  );
}