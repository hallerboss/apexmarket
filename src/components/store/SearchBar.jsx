import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SearchBar() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All Categories");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Category.list().then(setCategories).catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const cat = selected === "All Categories" ? "" : `&category=${encodeURIComponent(selected)}`;
    navigate(`/shop?q=${encodeURIComponent(q)}${cat}`);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 w-full">
      <div className="flex-1 flex items-stretch h-11 rounded-md border border-[#d8d8d8] bg-white overflow-hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="h-full px-3 lg:px-4 flex items-center gap-2 text-sm text-foreground border-r border-[#eeeeee] whitespace-nowrap hover:bg-muted/40"
          >
            {selected}
            <ChevronDown className="w-4 h-4" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-12 z-20 w-56 max-h-72 overflow-auto bg-white border border-[#eeeeee] shadow-lg py-1">
                <button
                  type="button"
                  onClick={() => { setSelected("All Categories"); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelected(c.name); setOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search in..."
            className="flex-1 bg-transparent text-sm outline-none h-full"
          />
          <Camera className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </div>
      </div>
      <button type="submit" className="h-11 px-5 lg:px-7 bg-accent text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity">
        Search
      </button>
      <button type="button" onClick={() => navigate("/shop")} className="hidden lg:block text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
        Advanced
      </button>
    </form>
  );
}