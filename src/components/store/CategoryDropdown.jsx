import { useState, useEffect } from "react";
import { List, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CategoryDropdown({ value, onSelect, label = "All Categories" }) {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    base44.entities.Category.list().then(setCats).catch(() => {});
  }, []);

  const choose = (c) => {
    setOpen(false);
    onSelect?.(c);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-4 flex items-center justify-between gap-2 bg-accent text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
      >
        <span className="flex items-center gap-2">
          <List className="w-4 h-4" /> {value || label}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-12 z-20 max-h-72 overflow-auto bg-white border border-[#eeeeee] shadow-lg py-1 rounded-md">
            <button
              type="button"
              onClick={() => choose("")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted hover:text-accent"
            >
              {label}
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => choose(c.name)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted hover:text-accent"
              >
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}