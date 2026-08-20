import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera } from "lucide-react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 w-full">
      <div className="flex-1 flex items-stretch h-11 rounded-md border border-[#d8d8d8] bg-white overflow-hidden">
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