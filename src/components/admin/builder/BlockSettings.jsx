import { Trash2 } from "lucide-react";
import { SelectField, ColorField } from "@/components/admin/builder/BuilderFields";
import { ALIGN_OPTIONS, PAD_OPTIONS, widgetLabel } from "@/lib/pageBlocks";
import { CONTENT_SETTINGS } from "@/components/admin/builder/settings/contentSettings";
import { COMMERCE_SETTINGS } from "@/components/admin/builder/settings/commerceSettings";
import { MEDIA_SETTINGS } from "@/components/admin/builder/settings/mediaSettings";
import { LAYOUT_SETTINGS } from "@/components/admin/builder/settings/layoutSettings";

const SETTINGS = {
  ...CONTENT_SETTINGS,
  ...COMMERCE_SETTINGS,
  ...MEDIA_SETTINGS,
  ...LAYOUT_SETTINGS,
};

const NO_LAYOUT_OPTIONS = ["hero", "spacer", "navAnchor"];

export default function BlockSettings({ block, onChange, onDelete }) {
  if (!block) {
    return (
      <p className="text-sm text-muted-foreground p-1">
        Select a widget on the canvas to edit its content and style.
      </p>
    );
  }

  const set = (patch) => onChange({ ...block, ...patch });
  const Fields = SETTINGS[block.type];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef0f2] pb-3">
        <h3 className="text-sm font-semibold">{widgetLabel(block.type)}</h3>
        <button type="button" onClick={onDelete} className="text-muted-foreground hover:text-red-500" title="Delete widget">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {Fields && <Fields block={block} set={set} />}

      {!NO_LAYOUT_OPTIONS.includes(block.type) && (
        <div className="space-y-4 border-t border-[#eef0f2] pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Layout</p>
          <SelectField label="Alignment" value={block.align || "left"} onChange={(v) => set({ align: v })} options={ALIGN_OPTIONS} />
          <ColorField label="Section background" value={block.bgColor || ""} onChange={(v) => set({ bgColor: v })} />
          <SelectField label="Section padding" value={block.pad || "md"} onChange={(v) => set({ pad: v })} options={PAD_OPTIONS} />
        </div>
      )}
    </div>
  );
}