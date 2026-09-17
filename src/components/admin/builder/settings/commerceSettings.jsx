import { useEffect, useState } from "react";
import { Field, SelectField, ItemsEditor } from "@/components/admin/builder/BuilderFields";
import { base44 } from "@/api/base44Client";

const COLUMN_OPTIONS = [
  { label: "2 columns", value: "2" },
  { label: "3 columns", value: "3" },
  { label: "4 columns", value: "4" },
];

function Products({ block, set }) {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    base44.entities.Category.list("order", 100).then(setCategories).catch(() => {});
  }, []);

  return (
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
      <SelectField
        label="Products shown"
        value={String(block.limit || 4)}
        onChange={(v) => set({ limit: Number(v) })}
        options={[{ label: "4", value: "4" }, { label: "8", value: "8" }, { label: "12", value: "12" }]}
      />
      <SelectField label="Columns" value={String(block.columns || 4)} onChange={(v) => set({ columns: Number(v) })} options={COLUMN_OPTIONS} />
    </>
  );
}

function Pricing({ block, set }) {
  return (
    <>
      <Field label="Section title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Plans"
        items={block.plans || []}
        onChange={(v) => set({ plans: v })}
        fields={[
          { key: "name", label: "Plan name" },
          { key: "price", label: "Price" },
          { key: "period", label: "Period" },
          { key: "features", label: "Features (comma separated)", type: "textarea" },
          { key: "ctaText", label: "Button label" },
          { key: "ctaHref", label: "Button link" },
        ]}
        blank={{ name: "Plan", price: "$0", period: "/month", features: "", ctaText: "Choose plan", ctaHref: "#" }}
        addLabel="Add plan"
      />
    </>
  );
}

function MenuPrice({ block, set }) {
  return (
    <>
      <Field label="Section title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Menu items"
        items={block.items || []}
        onChange={(v) => set({ items: v })}
        fields={[
          { key: "name", label: "Item name" },
          { key: "price", label: "Price" },
          { key: "description", label: "Description" },
        ]}
        blank={{ name: "Item", price: "$0.00", description: "" }}
        addLabel="Add item"
      />
    </>
  );
}

function MegaMenu({ block, set }) {
  return (
    <>
      <Field label="Title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <SelectField label="Columns" value={String(block.columns || 3)} onChange={(v) => set({ columns: Number(v) })} options={COLUMN_OPTIONS} />
      <ItemsEditor
        label="Links"
        items={block.links || []}
        onChange={(v) => set({ links: v })}
        fields={[{ key: "label", label: "Label" }, { key: "href", label: "Link" }]}
        blank={{ label: "Link", href: "/shop" }}
        addLabel="Add link"
      />
    </>
  );
}

function Sidebar({ block, set }) {
  return (
    <>
      <Field label="Heading">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Entries"
        items={(block.items || []).map((t) => ({ text: t }))}
        onChange={(arr) => set({ items: arr.map((o) => o.text) })}
        fields={[{ key: "text", label: "Entry" }]}
        blank={{ text: "" }}
        addLabel="Add entry"
      />
    </>
  );
}

function Testimonials({ block, set }) {
  return (
    <>
      <Field label="Section title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Testimonials"
        items={block.items || []}
        onChange={(v) => set({ items: v })}
        fields={[
          { key: "quote", label: "Quote", type: "textarea" },
          { key: "author", label: "Name" },
          { key: "role", label: "Role" },
        ]}
        blank={{ quote: "", author: "", role: "Verified buyer" }}
        addLabel="Add testimonial"
      />
    </>
  );
}

function Team({ block, set }) {
  return (
    <>
      <Field label="Section title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <SelectField label="Columns" value={String(block.columns || 3)} onChange={(v) => set({ columns: Number(v) })} options={COLUMN_OPTIONS} />
      <ItemsEditor
        label="Members"
        items={block.members || []}
        onChange={(v) => set({ members: v })}
        fields={[
          { key: "image", label: "Photo", type: "image" },
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
        ]}
        blank={{ image: "", name: "", role: "" }}
        addLabel="Add member"
      />
    </>
  );
}

function ContactForm({ block, set }) {
  return (
    <>
      <Field label="Title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Subtitle">
        <textarea rows={2} value={block.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
      <p className="text-[11px] text-muted-foreground">Messages land in Admin → the contact inbox.</p>
    </>
  );
}

function Newsletter({ block, set }) {
  return (
    <>
      <Field label="Title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Subtitle">
        <textarea rows={2} value={block.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
      <Field label="Input placeholder">
        <input value={block.placeholder || ""} onChange={(e) => set({ placeholder: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Button label">
        <input value={block.buttonLabel || ""} onChange={(e) => set({ buttonLabel: e.target.value })} className="admin-input text-sm" />
      </Field>
    </>
  );
}

export const COMMERCE_SETTINGS = {
  products: Products,
  pricing: Pricing,
  menuPrice: MenuPrice,
  megamenu: MegaMenu,
  sidebar: Sidebar,
  testimonials: Testimonials,
  team: Team,
  contactForm: ContactForm,
  newsletter: Newsletter,
};