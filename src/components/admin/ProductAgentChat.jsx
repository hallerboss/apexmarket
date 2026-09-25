import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Sparkles, Loader2, ImagePlus, FileInput, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Image as UiImage } from "@/components/ui/image";

const AGENT_NAME = "product_assistant";

export default function ProductAgentChat({ onClose, onInsert }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [inserted, setInserted] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let unsubscribe = null;
    base44.agents
      .createConversation({ agent_name: AGENT_NAME, metadata: { name: "Product Assistant" } })
      .then((c) => {
        setConversation(c);
        setMessages(c.messages || []);
        setLoading(false);
        unsubscribe = base44.agents.subscribeToConversation(c.id, (data) => {
          setMessages(data.messages || []);
        });
      })
      .catch(() => setLoading(false));
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, imageResult, analyzing]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    base44.agents
      .addMessage(conversation, { role: "user", content: msg })
      .finally(() => setSending(false));
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAnalyzing(true);
    setInserted(false);
    setImageResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("analyzeProductImage", {
        image_url: file_url,
        product_name: input.trim() || "",
      });
      const d = res?.data || res || {};
      setImageResult({
        image_url: file_url,
        description: d.description || "",
        short_description: d.short_description || "",
        features: d.features || [],
        seo_title: d.seo_title || "",
        meta_description: d.meta_description || "",
        focus_keywords: d.focus_keywords || [],
      });
      setInput("");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Image analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInsert = () => {
    if (!imageResult || !onInsert) return;
    onInsert({
      images: [imageResult.image_url],
      description: imageResult.description,
      short_description: imageResult.short_description,
      tags: imageResult.features,
      seo_title: imageResult.seo_title,
      meta_description: imageResult.meta_description,
      focus_keywords: imageResult.focus_keywords,
    });
    setInserted(true);
  };

  const suggestions = [
    "Generate a description for wireless earbuds",
    "Suggest SEO keywords for a smart watch",
    "Create a product: Cotton T-Shirt, $24.99",
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#e5e7eb] z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] bg-foreground text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-bold">AI Product Assistant</p>
            <p className="text-[10px] text-white/60">Free · Powered by Base44 AI</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : messages.length === 0 && !imageResult && !analyzing ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 mx-auto text-accent mb-4" />
            <p className="text-sm font-bold text-black">Hi! I'm your AI product assistant.</p>
            <p className="text-xs text-black/50 mt-2 mb-6">
              Upload a product image to auto-generate descriptions & features, or ask me anything.
            </p>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="block w-full text-left text-xs border border-[#e5e7eb] rounded-lg px-3 py-2.5 hover:border-accent hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm ${
                    m.role === "user" ? "bg-accent text-white" : "bg-[#f3f4f6] text-black"
                  }`}
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <ReactMarkdown className="prose prose-sm max-w-none">{m.content || ""}</ReactMarkdown>
                  )}
                  {m.tool_calls?.map((tc, j) => (
                    <div key={j} className="text-[10px] mt-1.5 opacity-60 flex items-center gap-1">
                      <Loader2 className="w-3 h-3" /> {tc.name} — {tc.status}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Image analysis result card */}
            {analyzing && (
              <div className="flex justify-start">
                <div className="bg-[#f3f4f6] px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-black/40" />
                  <span className="text-sm text-black/60">Analyzing image…</span>
                </div>
              </div>
            )}

            {imageResult && (
              <div className="border border-accent/30 rounded-lg overflow-hidden bg-white">
                <div className="aspect-video bg-[#f3f4f6] overflow-hidden">
                  {imageResult.image_url && (
                    <UiImage src={imageResult.image_url} alt="Analyzed product" className="w-full h-full" fittingType="fill" />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <p className="text-xs font-bold uppercase tracking-wide text-accent">AI Image Analysis</p>
                  </div>

                  {imageResult.short_description && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-1">Short Description</p>
                      <div className="text-xs text-black/80 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: imageResult.short_description }} />
                    </div>
                  )}

                  {imageResult.description && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-1">Full Description</p>
                      <div className="text-xs text-black/80 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: imageResult.description }} />
                    </div>
                  )}

                  {imageResult.features?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50 mb-1">Features ({imageResult.features.length})</p>
                      <ul className="space-y-1">
                        {imageResult.features.map((f, i) => (
                          <li key={i} className="text-xs text-black/80 flex items-start gap-1.5">
                            <span className="text-accent mt-0.5">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(imageResult.seo_title || imageResult.meta_description) && (
                    <div className="border-t border-[#e5e7eb] pt-3 space-y-1.5">
                      {imageResult.seo_title && (
                        <p className="text-xs"><span className="font-semibold text-black/50">SEO Title:</span> <span className="text-black/80">{imageResult.seo_title}</span></p>
                      )}
                      {imageResult.meta_description && (
                        <p className="text-xs"><span className="font-semibold text-black/50">Meta:</span> <span className="text-black/80">{imageResult.meta_description}</span></p>
                      )}
                      {imageResult.focus_keywords?.length > 0 && (
                        <p className="text-xs"><span className="font-semibold text-black/50">Keywords:</span> <span className="text-black/80">{imageResult.focus_keywords.join(", ")}</span></p>
                      )}
                    </div>
                  )}

                  {onInsert && (
                    <button
                      onClick={handleInsert}
                      disabled={inserted}
                      className="w-full mt-2 bg-accent text-white py-2.5 text-xs font-semibold uppercase tracking-[0.15em] rounded-md hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {inserted ? <><Check className="w-4 h-4" /> Inserted into Form</> : <><FileInput className="w-4 h-4" /> Insert into Form</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-[#f3f4f6] px-4 py-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-black/40" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={send} className="p-4 border-t border-[#e5e7eb] flex gap-2 shrink-0">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={analyzing}
          className="w-10 h-10 flex items-center justify-center border border-[#e5e7eb] rounded-lg text-black/50 hover:text-accent hover:border-accent disabled:opacity-50 transition-colors shrink-0"
          aria-label="Upload product image for AI analysis"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, SEO, descriptions…"
          className="flex-1 border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-accent text-white px-4 rounded-lg disabled:opacity-50 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}