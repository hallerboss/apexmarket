import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Camera, LayoutDashboard, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

export default function SearchBar({ autoFocus = false }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const cacheRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = q.toLowerCase().trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        let products = cacheRef.current;
        if (!products) {
          products = await base44.entities.Product.list("-created_date", 300);
          cacheRef.current = products;
        }
        const filtered = products
          .filter((p) =>
            p.name?.toLowerCase().includes(term) ||
            p.category?.toLowerCase().includes(term) ||
            p.brand?.toLowerCase().includes(term) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(term))
          )
          .slice(0, 6);
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) {
      setShowResults(false);
      navigate(`/shop?q=${encodeURIComponent(q)}`);
    }
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

  const pickResult = (p) => {
    setShowResults(false);
    setQ("");
    setResults([]);
    navigate(`/product/${p.id}`);
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5 sm:gap-2 w-full max-w-xl">
      <div className="flex-1 relative">
        <div className="flex items-stretch h-9 sm:h-10 rounded-md border border-[#d8d8d8] bg-white overflow-hidden">
          <div className="flex-1 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowResults(false); }}
              placeholder="Search products, categories, brands…"
              autoFocus={autoFocus}
              className="flex-1 bg-transparent text-sm outline-none h-full min-w-0"
            />
              {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />}
              {q && !searching && (
                <button type="button" onClick={() => { setQ(""); setResults([]); }} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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

        {/* Live results dropdown */}
        {showResults && q.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-md shadow-xl z-50 max-h-[70vh] overflow-y-auto">
            {results.length === 0 && !searching ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No products found for "{q}"
              </div>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickResult(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f7f7f8] transition-colors text-left border-b border-[#f0f0f0] last:border-0"
                >
                  <div className="w-10 h-10 bg-[#f3f4f6] shrink-0 overflow-hidden rounded">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt="" className="w-full h-full" fittingType="fill" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                        <Search className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.category}{p.brand ? ` · ${p.brand}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground shrink-0">
                    ${(p.sale_price || p.price || 0).toFixed(2)}
                  </span>
                </button>
              ))
            )}
            {results.length > 0 && (
              <button
                type="button"
                onClick={submit}
                className="w-full px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-accent hover:bg-accent/5 transition-colors border-t border-[#f0f0f0]"
              >
                View all results for "{q}"
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        onClick={submit}
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
    </div>
  );
}