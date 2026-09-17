import { Field, SelectField, ColorField, ItemsEditor } from "@/components/admin/builder/BuilderFields";
import { FONT_OPTIONS, SIZE_OPTIONS } from "@/lib/pageBlocks";

export const HEIGHT_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra large", value: "xl" },
];

const ICON_OPTIONS = [
  { label: "Star", value: "star" },
  { label: "Truck", value: "truck" },
  { label: "Shield", value: "shield" },
  { label: "Refresh", value: "refresh" },
  { label: "Heart", value: "heart" },
  { label: "Phone", value: "phone" },
  { label: "Mail", value: "mail" },
  { label: "Check", value: "check" },
];

const SIZE_FIELD = (block, set, fallback) => (
  <SelectField label="Size" value={block.fontSize || fallback} onChange={(v) => set({ fontSize: v })} options={SIZE_OPTIONS} />
);

function Heading({ block, set }) {
  return (
    <>
      <Field label="Text">
        <textarea rows={2} value={block.text || ""} onChange={(e) => set({ text: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
      <SelectField label="Font" value={block.fontFamily || "heading"} onChange={(v) => set({ fontFamily: v })} options={FONT_OPTIONS} />
      {SIZE_FIELD(block, set, "lg")}
      <ColorField label="Text color" value={block.color || ""} onChange={(v) => set({ color: v })} />
    </>
  );
}

function Text({ block, set }) {
  return (
    <>
      <Field label="Text">
        <textarea rows={6} value={block.text || ""} onChange={(e) => set({ text: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
      <SelectField label="Font" value={block.fontFamily || "serif"} onChange={(v) => set({ fontFamily: v })} options={FONT_OPTIONS} />
      {SIZE_FIELD(block, set, "md")}
      <ColorField label="Text color" value={block.color || ""} onChange={(v) => set({ color: v })} />
    </>
  );
}

function Button({ block, set }) {
  return (
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
  );
}

function Divider({ block, set }) {
  return <ColorField label="Line color" value={block.color || ""} onChange={(v) => set({ color: v })} />;
}

function Spacer({ block, set }) {
  return <SelectField label="Height" value={block.height || "md"} onChange={(v) => set({ height: v })} options={HEIGHT_OPTIONS} />;
}

function List({ block, set }) {
  return (
    <>
      <Field label="Title (optional)">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ItemsEditor
        label="Items"
        items={(block.items || []).map((t) => ({ text: t }))}
        onChange={(arr) => set({ items: arr.map((o) => o.text) })}
        fields={[{ key: "text", label: "Item text" }]}
        blank={{ text: "" }}
        addLabel="Add item"
      />
      <SelectField label="Font" value={block.fontFamily || "body"} onChange={(v) => set({ fontFamily: v })} options={FONT_OPTIONS} />
      {SIZE_FIELD(block, set, "md")}
      <ColorField label="Text color" value={block.textColor || ""} onChange={(v) => set({ textColor: v })} />
    </>
  );
}

function IconBox({ block, set }) {
  return (
    <>
      <SelectField label="Icon" value={block.icon || "star"} onChange={(v) => set({ icon: v })} options={ICON_OPTIONS} />
      <Field label="Title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Text">
        <textarea rows={3} value={block.text || ""} onChange={(e) => set({ text: e.target.value })} className="admin-input text-sm resize-none" />
      </Field>
    </>
  );
}

function Counter({ block, set }) {
  return (
    <>
      <ItemsEditor
        label="Counters"
        items={block.items || []}
        onChange={(v) => set({ items: v })}
        fields={[{ key: "value", label: "Number" }, { key: "label", label: "Label" }]}
        blank={{ value: "100", label: "Label" }}
        addLabel="Add counter"
      />
      <ColorField label="Number color" value={block.textColor || ""} onChange={(v) => set({ textColor: v })} />
    </>
  );
}

function Countdown({ block, set }) {
  return (
    <>
      <Field label="Title">
        <input value={block.title || ""} onChange={(e) => set({ title: e.target.value })} className="admin-input text-sm" />
      </Field>
      <Field label="Target date & time">
        <input type="datetime-local" value={block.date || ""} onChange={(e) => set({ date: e.target.value })} className="admin-input text-sm" />
      </Field>
      <ColorField label="Text color" value={block.textColor || ""} onChange={(v) => set({ textColor: v })} />
    </>
  );
}

export const CONTENT_SETTINGS = {
  heading: Heading,
  text: Text,
  button: Button,
  divider: Divider,
  spacer: Spacer,
  list: List,
  iconBox: IconBox,
  counter: Counter,
  countdown: Countdown,
};