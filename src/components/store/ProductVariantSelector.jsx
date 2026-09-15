import { Check } from "lucide-react";

const COLOR_HEX = {
  red: "#dc2626", crimson: "#dc143c", maroon: "#800000", burgundy: "#800020",
  rose: "#ff007f", pink: "#ec4899", "hot pink": "#ff69b4", coral: "#ff7f50",
  salmon: "#fa8072", orange: "#f97316", peach: "#ffdab9", amber: "#f59e0b",
  gold: "#d4af37", yellow: "#facc15", mustard: "#ffdb58", lime: "#84cc16",
  olive: "#808000", green: "#16a34a", emerald: "#059669", jade: "#00a86b",
  mint: "#98ff98", teal: "#14b8a6", cyan: "#06b6d4", turquoise: "#40e0d0",
  "sky blue": "#38bdf8", blue: "#2563eb", navy: "#1e2a4a", "royal blue": "#4169e1",
  indigo: "#4f46e5", sapphire: "#0f52ba", purple: "#7c3aed", violet: "#8b5cf6",
  lavender: "#b496c7", lilac: "#c8a2c8", plum: "#8e4585", magenta: "#d136c4",
  fuchsia: "#d946ef", brown: "#7c5e3c", chocolate: "#d2691e", coffee: "#6f4e37",
  tan: "#d2b48c", beige: "#e8d8c0", khaki: "#c3b091", camel: "#c19a6b",
  gray: "#9ca3af", grey: "#9ca3af", charcoal: "#36454f", slate: "#64748b",
  silver: "#c0c0c0", white: "#ffffff", cream: "#fffdd0", ivory: "#fffff0",
  "off white": "#f5f5dc", "off-white": "#f5f5dc", black: "#000000", onyx: "#0a0a0a",
};

const colorHex = (name) => {
  const key = String(name).toLowerCase().trim();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  return null;
};

export default function ProductVariantSelector({ variants, selected, onSelect, variantImageFor, onImageSelect }) {
  if (!variants?.length) return null;

  return (
    <div className="space-y-5 mb-6">
      {variants.map((v) => {
        const name = v.name || "";
        const isColor = /color|colour/i.test(name);
        const isSize = /size/i.test(name);
        const isGender = /gender/i.test(name);
        const selectedVal = selected[name];
        const opts = (v.options || []).filter(Boolean);

        return (
          <div key={name}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold">
                {name}
                {selectedVal && <span className="text-muted-foreground ml-2 normal-case tracking-normal">— {selectedVal}</span>}
              </p>
              {!selectedVal && <span className="text-[10px] text-muted-foreground/70">Required</span>}
            </div>

            {isColor ? (
              /* Color swatches — visual circles */
              <div className="flex flex-wrap gap-2.5">
                {opts.map((opt) => {
                  const hex = colorHex(opt);
                  const vImg = variantImageFor?.(name, opt);
                  const isSelected = selectedVal === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onSelect(name, opt);
                        if (vImg) onImageSelect?.(vImg);
                      }}
                      title={opt}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected ? "border-foreground scale-110 shadow-md" : "border-border hover:border-foreground hover:scale-105"
                      }`}
                    >
                      {vImg ? (
                        <img src={vImg} alt={opt} className="w-full h-full object-cover rounded-full" />
                      ) : hex ? (
                        <span className="w-full h-full rounded-full block" style={{ backgroundColor: hex }} />
                      ) : (
                        <span className="text-[9px] font-medium leading-none text-center px-1">{opt.slice(0, 6)}</span>
                      )}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Size / Gender / other attributes — pill buttons */
              <div className="flex flex-wrap gap-2">
                {opts.map((opt) => {
                  const isSelected = selectedVal === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onSelect(name, opt)}
                      className={`px-4 py-2 text-sm border transition-all min-w-[48px] text-center ${
                        isSelected
                          ? "border-foreground bg-foreground text-background font-semibold"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}