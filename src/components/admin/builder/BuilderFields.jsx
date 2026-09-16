import { useState } from "react";
import { Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="admin-input text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#111111"}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 border border-[#e5e7eb] bg-white p-0.5 cursor-pointer shrink-0"
        />
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Default"
          className="admin-input text-sm flex-1"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-black">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Field>
  );
}

export function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);

  const upload = async (file) => {
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="w-16 h-16 object-cover border border-[#e5e7eb] shrink-0" />
        ) : (
          <div className="w-16 h-16 bg-[#f3f4f6] border border-[#e5e7eb] shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <label className="inline-flex items-center gap-2 border border-[#e5e7eb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] cursor-pointer hover:bg-[#fafafa]">
            {busy ? "Uploading…" : <><Upload className="w-3.5 h-3.5" /> Upload</>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="block text-[11px] text-muted-foreground hover:text-black">
              Remove image
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}