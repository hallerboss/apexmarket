import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Check, X } from "lucide-react";

export default function FieldAIButton({ type, imageUrl, productName, productDescription, onSelect, label }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const generate = async () => {
    if ((type === "title" || type === "short_description") && !imageUrl) {
      alert("Upload a product image first, then use AI.");
      return;
    }
    setOpen(true);
    setLoading(true);
    setOptions([]);
    try {
      const res = await base44.functions.invoke("generateProductField", {
        type,
        image_url: imageUrl,
        product_name: productName,
        product_description: productDescription,
      });
      const d = res.data?.result || {};
      if (type === "title" || type === "seo_title") {
        setOptions(d.titles || []);
      } else if (type === "meta_description") {
        setOptions(d.descriptions || []);
      } else if (type === "focus_keywords") {
        setOptions(d.keywords || []);
      } else if (type === "short_description") {
        if (d.features_html) {
          onSelect(d.features_html);
          setOpen(false);
        }
      }
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "AI generation failed");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const pick = (val) => {
    setSelected(val);
    onSelect(val);
    setTimeout(() => { setOpen(false); setSelected(null); }, 700);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={generate}
        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-accent border border-accent/30 px-2 py-1 rounded hover:bg-accent hover:text-white transition-colors"
      >
        <Sparkles className="w-3 h-3" /> {label || "AI"}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 w-80 max-h-80 overflow-y-auto bg-white border border-[#e5e7eb] shadow-xl rounded-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e7eb] bg-[#fafafa] sticky top-0">
            <span className="text-[10px] font-bold uppercase tracking-wide text-accent flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Suggestions
            </span>
            <button onClick={() => setOpen(false)} className="text-black/40 hover:text-black">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="p-6 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : options.length === 0 ? (
            <div className="p-4 text-xs text-black/40 text-center">No options generated.</div>
          ) : (
            <div className="divide-y divide-[#eef0f2]">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(opt)}
                  className={`w-full text-left px-3 py-2.5 text-xs hover:bg-accent/5 transition-colors flex items-start gap-2 ${
                    selected === opt ? "bg-accent/10" : ""
                  }`}
                >
                  {selected === opt ? (
                    <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-3.5 text-black/30 shrink-0 mt-0.5">{i + 1}.</span>
                  )}
                  <span className="text-black/80">{opt}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}