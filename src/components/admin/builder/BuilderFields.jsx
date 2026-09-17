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

export function ItemsEditor({ label, items, onChange, fields, blank, addLabel = "Add item" }) {
  const list = items || [];
  const update = (i, key, val) => onChange(list.map((it, j) => (j === i ? { ...it, [key]: val } : it)));
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const add = () => onChange([...list, { ...blank }]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
        <button type="button" onClick={add} className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent hover:underline">
          + {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {list.map((it, i) => (
          <div key={i} className="relative border border-[#e5e7eb] p-3 pt-4 space-y-2">
            <button type="button" onClick={() => remove(i)} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
            {fields.map((f) => (
              <div key={f.key}>
                {f.type === "image" ? (
                  <ImageField label={f.label} value={it[f.key] || ""} onChange={(v) => update(i, f.key, v)} />
                ) : (
                  <>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">{f.label}</span>
                    {f.type === "textarea" ? (
                      <textarea rows={2} value={it[f.key] || ""} onChange={(e) => update(i, f.key, e.target.value)} className="admin-input text-sm resize-none" />
                    ) : f.type === "select" ? (
                      <select value={it[f.key] || f.options[0].value} onChange={(e) => update(i, f.key, e.target.value)} className="admin-input text-sm">
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input value={it[f.key] || ""} onChange={(e) => update(i, f.key, e.target.value)} className="admin-input text-sm" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
        {!list.length && <p className="text-xs text-muted-foreground">Nothing added yet.</p>}
      </div>
    </div>
  );
}