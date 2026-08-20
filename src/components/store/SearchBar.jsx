import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Camera, LayoutDashboard } from "lucide-react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 w-full max-w-xl">
      <div className="flex-1 flex items-stretch h-10 rounded-md border border-[#d8d8d8] bg-white overflow-hidden">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search in..."
            className="flex-1 bg-transparent text-sm outline-none h-full"
          />
          <Camera className="w-4 h-4 text-muted-foreground cursor-pointer" />
        </div>
      </div>
      <button type="submit" className="h-10 px-5 bg-accent text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity">
        Search
      </button>
      <Link
        to="/admin"
        className="h-10 px-4 flex items-center gap-1.5 text-sm font-semibold text-accent border border-accent rounded-md hover:bg-accent hover:text-white transition-colors whitespace-nowrap"
      >
        <LayoutDashboard className="w-4 h-4" /> Admin
      </Link>
    </form>
  );
}