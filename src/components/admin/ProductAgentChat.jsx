import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "product_assistant";

export default function ProductAgentChat({ onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

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
  }, [messages]);

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
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 mx-auto text-accent mb-4" />
            <p className="text-sm font-bold text-black">Hi! I'm your AI product assistant.</p>
            <p className="text-xs text-black/50 mt-2 mb-6">
              I can generate descriptions, SEO metadata, features, and even create products for you.
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
          messages.map((m, i) => (
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
          ))
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
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, SEO, descriptions…"
          className="flex-1 border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-accent text-white px-4 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}