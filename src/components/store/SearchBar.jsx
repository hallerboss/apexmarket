import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Camera, LayoutDashboard, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SearchBar({ autoFocus = false }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("imageSearch", { image_url: file_url });
      const query = (res?.query || "").trim();
      navigate(`/shop?q=${encodeURIComponent(query)}`);
    } catch (err) {
      console.error("Image search failed", err);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-1.5 sm:gap-2 w-full max-w-xl">
      <div className="flex-1 flex items-stretch h-9 sm:h-10 rounded-md border border-[#d8d8d8] bg-white overflow-hidden">
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search in..."
            autoFocus={autoFocus}
            className="flex-1 bg-transparent text-sm outline-none h-full min-w-0"
          />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="text-muted-foreground hover:text-accent disabled:opacity-50 shrink-0"
            aria-label="Search by image"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 cursor-pointer" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex h-9 sm:h-10 px-4 lg:px-5 bg-accent text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity items-center"
      >
        Search
      </button>
      <Link
        to="/admin"
        className="h-9 sm:h-10 px-2.5 sm:px-4 flex items-center gap-1.5 text-sm font-semibold text-accent border border-accent rounded-md hover:bg-accent hover:text-white transition-colors whitespace-nowrap"
      >
        <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
      </Link>
    </form>
  );
}