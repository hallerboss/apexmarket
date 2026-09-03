import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Star, ImagePlus, ThumbsUp, Flag, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const STOPWORDS = new Set([
  "this", "that", "with", "from", "they", "them", "their", "there", "these", "those",
  "have", "been", "very", "really", "would", "could", "should", "about", "which",
  "your", "yours", "product", "item", "order", "ordered", "received", "purchase",
  "purchased", "arrived", "shipping", "delivery", "first", "still", "just", "also",
]);
const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url || "");

export default function CustomerReviews({ productId, productName, rating }) {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [helpful, setHelpful] = useState({});
  const [reported, setReported] = useState({});
  const [form, setForm] = useState({ author: "", email: "", rating: 5, title: "", comment: "" });
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const galleryRef = useRef(null);

  const load = () =>
    base44.entities.Review.filter({ product_id: productId, status: "approved" })
      .then(setReviews)
      .finally(() => setLoaded(true));

  useEffect(() => { load(); }, [productId]);

  const uploadMedia = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => base44.integrations.Core.UploadFile({ file: f })));
      setMedia((cur) => [...cur, ...uploaded.map((u) => u.file_url)]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await base44.functions.invoke("submitReview", {
        product_id: productId,
        product_name: productName,
        author: form.author,
        email: form.email,
        rating: form.rating,
        title: form.title,
        comment: form.comment,
        media,
      });
      await load();
      setSubmitted(true);
      setForm({ author: "", email: "", rating: 5, title: "", comment: "" });
      setMedia([]);
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Failed to submit review");
    }
  };

  // Aggregate stats
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : rating || 0;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { const n = Math.round(r.rating); counts[n] = (counts[n] || 0) + 1; });

  // Topic keywords extracted from review text
  const wordCounts = {};
  reviews.forEach((r) => {
    ((r.title || "") + " " + (r.comment || "")).toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).forEach((w) => {
      if (w.length > 4 && !STOPWORDS.has(w)) wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
  });
  const topics = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const gallery = reviews.flatMap((r) => r.media || []).filter((u) => !isVideo(u));
  const shown = activeTopic
    ? reviews.filter((r) => ((r.title || "") + " " + (r.comment || "")).toLowerCase().includes(activeTopic))
    : reviews;

  const scrollGallery = (dir) => galleryRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  const inputCls = "w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none";

  return (
    <div className="border hairline bg-card p-6 lg:p-10">
      <h3 className="text-lg font-bold mb-6">Customer reviews</h3>
      <div className="grid md:grid-cols-[240px_1fr] gap-8 lg:gap-14">
        {/* Left column — summary */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-5 h-5 ${n <= Math.round(avg) ? "fill-[#ff9f43] text-[#ff9f43]" : "text-muted-foreground/40"}`} />
              ))}
            </div>
            <span className="text-base font-bold">{Number(avg).toFixed(1)} out of 5</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{total} global ratings</p>

          <div className="space-y-1.5 mb-6">
            {[5, 4, 3, 2, 1].map((n) => {
              const pct = total ? Math.round((counts[n] / total) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-sm text-accent w-10">{n} star</span>
                  <div className="flex-1 h-4 bg-secondary overflow-hidden">
                    <div className="h-full bg-[#ff9f43] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-9 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>

          <button onClick={() => setShowHow((s) => !s)} className="flex items-center gap-1 text-sm text-accent mb-6">
            How customer reviews and ratings work <ChevronDown className={`w-4 h-4 transition-transform ${showHow ? "rotate-180" : ""}`} />
          </button>
          {showHow && (
            <p className="text-xs text-muted-foreground border hairline p-3 mb-6">
              Our ratings are calculated from verified customer reviews. Each star rating is aggregated to produce the overall score and the histogram above.
            </p>
          )}

          <p className="font-semibold mb-1">Review this product</p>
          <p className="text-sm text-muted-foreground mb-4">Share your thoughts with other customers</p>
          <button
            onClick={() => { setShowForm((s) => !s); setSubmitted(false); }}
            className="w-full rounded-full border border-[#555] py-2 text-sm font-medium hover:bg-secondary transition-colors"
          >
            {showForm ? "Close review form" : "Write a customer review"}
          </button>
        </div>

        {/* Right column — insights + list */}
        <div>
          {total > 0 ? (
            <>
              <p className="font-bold mb-1">Customers say</p>
              <p className="text-sm text-muted-foreground max-w-prose mb-1">
                {avg >= 4 ? `Customers love the ${productName || "product"}` : `Customers share feedback on the ${productName || "product"}`}
                {topics.length > 0 && `, frequently mentioning ${topics.slice(0, 3).map((t) => t[0]).join(", ")} in their reviews.`}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mb-5">Summary generated from customer reviews</p>

              {topics.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm mb-2">Select to learn more</p>
                  <div className="flex flex-wrap gap-2">
                    {topics.map(([w, c]) => (
                      <button
                        key={w}
                        onClick={() => setActiveTopic((t) => (t === w ? null : w))}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          activeTopic === w ? "border-accent bg-accent/10 text-accent" : "border-border text-accent hover:border-accent"
                        }`}
                      >
                        {w[0].toUpperCase() + w.slice(1)} <span className="text-muted-foreground">({c})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="serif-text text-muted-foreground mb-8">
              {loaded ? "No reviews yet. Be the first to share your thoughts with other customers." : "Loading reviews…"}
            </p>
          )}

          {/* Reviews with images gallery */}
          {gallery.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold">Reviews with images</p>
                <button onClick={() => scrollGallery(1)} className="text-sm text-accent inline-flex items-center">
                  See all photos <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <div ref={galleryRef} className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
                  {gallery.map((url, i) => (
                    <div key={i} className="w-24 h-24 shrink-0 overflow-hidden bg-secondary">
                      <Image src={url} alt="" className="w-full h-full object-cover" fittingType="fill" />
                    </div>
                  ))}
                </div>
                <button onClick={() => scrollGallery(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border hairline rounded-full w-7 h-7 flex items-center justify-center shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => scrollGallery(1)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border hairline rounded-full w-7 h-7 flex items-center justify-center shadow-sm"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Write review form */}
          {showForm && (
            submitted ? (
              <div className="bg-secondary p-6 text-center mb-8">
                <p className="serif-text text-lg">Thank you. Your review is now live.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 border hairline p-5 mb-8">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold">Write a Review</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="Your name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputCls} />
                  <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                      <Star className={`w-5 h-5 ${n <= form.rating ? "fill-[#ff9f43] text-[#ff9f43]" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
                <input placeholder="Review title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
                <textarea required placeholder="Your review…" rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className={`${inputCls} resize-none`} />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">Add Photo / Video</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm border hairline px-4 py-2.5 cursor-pointer hover:border-accent inline-flex items-center gap-2">
                      <ImagePlus className="w-4 h-4" /> Upload
                      <input type="file" accept="image/*,video/*" multiple onChange={uploadMedia} className="hidden" disabled={uploading} />
                    </label>
                    {uploading && <span className="text-sm text-muted-foreground">Uploading…</span>}
                    {media.map((url, mi) => (
                      <div key={mi} className="relative w-14 h-14 overflow-hidden bg-secondary">
                        {isVideo(url) ? <video src={url} className="w-full h-full object-cover" /> : <Image src={url} alt="" className="w-full h-full object-cover" fittingType="fill" />}
                        <button type="button" onClick={() => setMedia((c) => c.filter((_, i) => i !== mi))} className="absolute top-0 right-0 bg-foreground text-background w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-mono-solid">Submit Review</button>
              </form>
            )
          )}

          {/* Review list */}
          <div className="space-y-8">
            {shown.map((r) => (
              <div key={r.id} className="border-b hairline pb-6">
                <div className="flex items-center gap-3 mb-2">
                  {r.avatar ? (
                    <img src={r.avatar} alt={r.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold shrink-0">{(r.author || "?")[0]?.toUpperCase()}</div>
                  )}
                  <div>
                    <span className="text-sm font-semibold block">{r.author}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-[#ff9f43] text-[#ff9f43]" : "text-muted-foreground/40"}`} />)}</div>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {r.title && <p className="font-bold text-sm mb-1">{r.title}</p>}
                <p className="serif-text text-sm text-muted-foreground mb-2">{r.comment}</p>
                {r.media?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {r.media.map((url, mi) => (
                      <a key={mi} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 overflow-hidden bg-secondary">
                        {isVideo(url) ? <video src={url} className="w-full h-full object-cover" /> : <Image src={url} alt="" className="w-full h-full object-cover" fittingType="fill" />}
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => setHelpful((h) => ({ ...h, [r.id]: !h[r.id] }))}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${helpful[r.id] ? "border-accent text-accent bg-accent/5" : "border-[#555] hover:bg-secondary"}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {helpful[r.id] ? "Found this helpful" : "Helpful"}
                  </button>
                  <button onClick={() => setReported((p) => ({ ...p, [r.id]: !p[r.id] }))} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Flag className="w-3.5 h-3.5" /> {reported[r.id] ? "Reported" : "Report"}
                  </button>
                </div>
              </div>
            ))}
            {activeTopic && shown.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews mention "{activeTopic}".</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}