import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Field, SelectField, ColorField, ImageField } from "@/components/admin/builder/BuilderFields";
import { FONT_OPTIONS, ALIGN_OPTIONS, PAD_OPTIONS, SIZE_OPTIONS } from "@/lib/pageBlocks";

const HEIGHT_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra large", value: "xl" },
];

export default function BlockSettings({ block, onChange, onDelete }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    base44.entities.Category.list("order", 100).then(setCategories).catch(() => {});
  }, []);

  if (!block) {
    return <p className="text-sm text-muted-foreground p-1">Select a block on the canvas to edit its content and style.</p>;
  }

  const set = (patch) => onChange({ ...block, ...patch });
  const t = block.type;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef0f2] pb-3">
        <h3 className="text-sm font-semibold capitalize">{t} block</h3>
        <button type="button" onClick={onDelete} className="text-muted-foreground hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {t === "heading" && (
        <>
          <Field label="Text">
            <textarea rows={2} value={block.text || ""} onChange={(e) => set({ text: e.target.value })} className="admin-input text-sm resize-none" />
          </Field>
          <SelectField label="Font" value={block.fontFamily || "heading"} onChange={(v) => set({ fontFamily: v })} options={FONT_OPTIONS} />
          <SelectField label="Size" value={block.fontSize || "lg"} onChange={(v) => set({ fontSize: v })} options={SIZE_OPTIONS} />
          <ColorField label="Text color" value={block.color || ""} onChange={(v) => set({ color: v })} />
        </>
      )}

      {t === "text" && (
        <>
          <Field label="Text">
            <textarea rows={6} value={block.text || ""} onChange={(e) => set({ text: e.target.value })} className="admin-input text-sm resize-none" />
          </Field>
          <SelectField label="Font" value={block.fontFamily || "serif"} onChange={(v) => set({ fontFamily: v })} options={FONT_OPTIONS} />
          <SelectField label="Size" value={block.fontSize || "md"} onChange={(v) => set({ fontSize: v })} options={SIZE_OPTIONS} />
          <ColorField label="Text color" value={block.color || ""} onChange={(v) => set({ color: v })} />
        </>
      )}

      {t === "button" && (
        <>
          <Field label="Label">
            <input value={block.label || ""} onChange={(e) => set({ label: e.target.value })} className="admin-input text-sm" />
          </Field>
          <Field label="Link">
            <input value={block.href || ""} onChange={(e) => set({ href: e.target.value })} className="admin-input text-sm" />
          </Field>
          <ColorField label="Background" value={block.bgColor || ""} onChange={(v) => set({ bgColor: v })} />
          <ColorField label="Text color" value={block.textColor || ""} onChange={(v) => set({ textColor: v })} />
        </>
      )}

      {t === "image" && (
        <>
          <ImageField label="Image" value={block.url || ""} onChange={(v) => set({ url: v })} />
          <Field label="Alt text">
            <input value={block.alt || ""} onChange={(e) => set({ alt: e.target.value })} className="admin-input text-sm" />
          </Field>
          <SelectField label="Height" value={block.height || "md"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />
        </>
      )}

      {t === "hero" && (
        <>
          <Field label="Title">
            <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
          </Field>
          <Field label="Subtitle">
            <textarea rows={2} value={block.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} className="admin-input text-sm resize-none" />
          </Field>
          <ImageField label="Background image" value={block.image || ""} onChange={(v) => set({ image: v })} />
          <Field label="Button text">
            <input value={block.ctaText || ""} onChange={(e) => set({ ctaText: e.target.value })} className="admin-input text-sm" />
          </Field>
          <Field label="Button link">
            <input value={block.ctaHref || ""} onChange={(e) => set({ ctaHref: e.target.value })} className="admin-input text-sm" />
          </Field>
          <SelectField label="Height" value={block.height || "lg"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />
          <SelectField label="Alignment" value={block.align || "left"} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
        </>
      )}

      {t === "products" && (
        <>
          <Field label="Section title">
            <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
          </Field>
          <SelectField
            label="Category"
            value={block.category || ""}
            onChange={(v) => set({ category: v })}
            options={[{ label: "All products", value: "" }, ...categories.map((c) => ({ label: c.name, value: c.name }))]}
          />
          <SelectField label="Products shown" value={String(block.limit || 4)} onChange={(v) => set({ limit: Number(v) })} options={[{ label: "4", value: "4" }, { label: "8", value: "8" }, { label: "12", value: "12" }]} />
          <SelectField label="Columns" value={String(block.columns || 4)} onChange={(v) => set({ columns: Number(v) })} options={[{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]} />
        </>
      )}

      {t === "divider" && <ColorField label="Line color" value={block.color || ""} onChange={(v) => set({ color: v })} />}

      {t === "spacer" && <SelectField label="Height" value={block.height || "md"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />}

      {t !== "spacer" && t !== "hero" && (
        <>
          <SelectField label="Alignment" value={block.align || "left"} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
          <ColorField label="Section background" value={block.bgColor || ""} onChange={(v) => set({ bgColor: v })} />
          <SelectField label="Section padding" value={block.pad || "md"} onChange={(v) => set({ pad: v })} options={PAD_OPTIONS} />
        </>
      )}
    </div>
  );
}