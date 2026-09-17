import { Field, SelectField, ImageField, ItemsEditor } from "@/components/admin/builder/BuilderFields";
import { ALIGN_OPTIONS } from "@/lib/pageBlocks";
import { HEIGHT_OPTIONS } from "./contentSettings";

const COLUMN_OPTIONS = [
  { label: "2 columns", value: "2" },
  { label: "3 columns", value: "3" },
  { label: "4 columns", value: "4" },
];

const NETWORKS = [
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "X", value: "x" },
  { label: "YouTube", value: "youtube" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
];

function Hero({ block, set }) {
  return (
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
  );
}

function ImageBlock({ block, set }) {
  return (
    <>
      <ImageField label="Image" value={block.url || ""} onChange={(v) => set({ url: v })} />
      <Field label="Alt text">
        <input value={block.alt || ""} onChange={(e) => set({ alt: e.target.value })} className="admin-input text-sm" />
      </Field>
      <SelectField label="Height" value={block.height || "md"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />
    </>
  );
}

function Gallery({ block, set }) {
  return (
    <>
      <Field label="Title (optional)">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <SelectField label="Columns" value={String(block.columns || 3)} onChange={(v) => set({ columns: Number(v) })} options={COLUMN_OPTIONS} />
      <SelectField label="Image height" value={block.height || "md"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />
      <ItemsEditor
        label="Images"
        items={(block.images || []).map((url) => ({ url }))}
        onChange={(arr) => set({ images: arr.map((o) => o.url) })}
        fields={[{ key: "url", label: "Image", type: "image" }]}
        blank={{ url: "" }}
        addLabel="Add image"
      />
    </>
  );
}

function Video({ block, set }) {
  return (
    <>
      <Field label="Video URL">
        <input value={block.url || ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="admin-input text-sm" />
      </Field>
      <Field label="Caption">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
    </>
  );
}

function MapBlock({ block, set }) {
  return (
    <>
      <Field label="Address or place">
        <input value={block.address || ""} onChange={(e) => set({ address: e.target.value })} className="admin-input text-sm" />
      </Field>
      <SelectField label="Height" value={block.height || "md"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />
    </>
  );
}

function Hotspot({ block, set }) {
  return (
    <>
      <Field label="Title (optional)">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ImageField label="Lifestyle image" value={block.image || ""} onChange={(v) => set({ image: v })} />
      <ItemsEditor
        label="Hotspots"
        items={block.points || []}
        onChange={(v) => set({ points: v })}
        fields={[
          { key: "x", label: "Horizontal %" },
          { key: "y", label: "Vertical %" },
          { key: "label", label: "Label" },
          { key: "href", label: "Link" },
        ]}
        blank={{ x: "50", y: "50", label: "Product", href: "/shop" }}
        addLabel="Add hotspot"
      />
      <p className="text-[11px] text-muted-foreground">Position is measured from the top-left corner of the image.</p>
    </>
  );
}

function Social({ block, set }) {
  return (
    <>
      <Field label="Heading">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Buttons"
        items={block.links || []}
        onChange={(v) => set({ links: v })}
        fields={[
          { key: "network", label: "Network", type: "select", options: NETWORKS },
          { key: "href", label: "Link" },
        ]}
        blank={{ network: "instagram", href: "" }}
        addLabel="Add button"
      />
    </>
  );
}

export const MEDIA_SETTINGS = {
  hero: Hero,
  image: ImageBlock,
  gallery: Gallery,
  video: Video,
  map: MapBlock,
  hotspot: Hotspot,
  social: Social,
};