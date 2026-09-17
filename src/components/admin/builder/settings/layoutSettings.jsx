import { Field, ItemsEditor } from "@/components/admin/builder/BuilderFields";

function CallToAction({ block, set }) {
  return (
    <>
      <Field label="Title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Subtitle">
        <textarea rows={2} value={block.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
      <Field label="Button text">
        <input value={block.ctaText || ""} onChange={(e) => set({ ctaText: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Button link">
        <input value={block.ctaHref || ""} onChange={(e) => set({ ctaHref: e.target.value })} className="admin-input text-sm" />
      </Field>
    </>
  );
}

function Timeline({ block, set }) {
  return (
    <>
      <Field label="Section title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Milestones"
        items={block.items || []}
        onChange={(v) => set({ items: v })}
        fields={[
          { key: "date", label: "Date / Year" },
          { key: "title", label: "Title" },
          { key: "text", label: "Text", type: "textarea" },
        ]}
        blank={{ date: "2026", title: "Milestone", text: "" }}
        addLabel="Add milestone"
      />
    </>
  );
}

function Tabs({ block, set }) {
  return (
    <ItemsEditor
      label="Tabs"
      items={block.items || []}
      onChange={(v) => set({ items: v })}
      fields={[
        { key: "title", label: "Tab label" },
        { key: "text", label: "Tab content", type: "textarea" },
      ]}
      blank={{ title: "Tab", text: "" }}
      addLabel="Add tab"
    />
  );
}

function NavAnchor({ block, set }) {
  return (
    <Field label="Anchor name">
      <input value={block.anchor || ""} onChange={(e) => set({ anchor: e.target.value })} placeholder="section-1" className="admin-input text-sm" />
    </Field>
  );
}

function Popup({ block, set }) {
  return (
    <>
      <Field label="Button label">
        <input value={block.buttonLabel || ""} onChange={(e) => set({ buttonLabel: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Popup title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Popup text">
        <textarea rows={3} value={block.text || ""} onChange={(e) => set({ text: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
    </>
  );
}

export const LAYOUT_SETTINGS = {
  cta: CallToAction,
  timeline: Timeline,
  tabs: Tabs,
  navAnchor: NavAnchor,
  popup: Popup,
};