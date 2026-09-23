import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/themeContext";
import { Sparkles, X, Send, Loader2, Wand2, Undo2, Bot, Check } from "lucide-react";

const GREETING =
  "Hi! I'm your AI design assistant. Tell me what to change about the store — colors, fonts, sizing, mood — and I'll apply it live across your site.";

const SUGGESTIONS = [
  "Make the accent color a warm terracotta",
  "Use Playfair Display for headings and Inter for body",
  "Switch to a dark, moody premium look",
  "Make corners fully sharp (0rem radius)",
];

export default function AdminDesignAgent() {
  const location = useLocation();
  const { theme, applyTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [working, setWorking] = useState(false);
  const [lastChange, setLastChange] = useState(null);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  // Auto-open with greeting on the dashboard (once per session)
  useEffect(() => {
    if (location.pathname !== "/admin") return;
    if (sessionStorage.getItem("design_agent_greeted")) return;
    sessionStorage.setItem("design_agent_greeted", "1");
    setTimeout(() => {
      setMessages([{ role: "assistant", content: GREETING }]);
      setOpen(true);
    }, 800);
  }, [location.pathname]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, working]);

  const send = async (e, override) => {
    e?.preventDefault();
    const msg = (override ?? input).trim();
    if (!msg || working) return;
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setWorking(true);
    try {
      const res = await base44.functions.invoke("aiDesignAssistant", {
        message: msg,
        currentTheme: theme || {},
      });
      const data = res?.data || res || {};
      if (data.error) throw new Error(data.error);
      if (data.theme) {
        setLastChange({ theme: data.theme, prevTheme: theme, changes: data.changes || [] });
        applyTheme(data.theme);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Done.", changes: data.changes || [] },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "The assistant is unavailable right now.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `I couldn't do that — ${msg}`, isError: true },
      ]);
    } finally {
      setWorking(false);
    }
  };

  const undo = async () => {
    if (!lastChange?.prevTheme) return;
    const prev = lastChange.prevTheme;
    applyTheme(prev);
    setLastChange(null);
    setMessages((prev) => [...prev, { role: "assistant", content: "Reverted to your previous design." }]);
    // Persist the revert
    try {
      const settings = await base44.entities.SiteSetting.list();
      const row = settings.find((s) => s.key === "theme");
      const value = JSON.stringify(prev);
      if (row) await base44.entities.SiteSetting.update(row.id, { value });
      else await base44.entities.SiteSetting.create({ key: "theme", value });
    } catch {
      /* local revert already applied */
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 bg-foreground text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform group"
          aria-label="Open AI design assistant"
        >
          <Sparkles className="w-6 h-6 text-accent group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[400px] max-h-[90vh] sm:max-h-[600px] bg-white border border-[#e5e7eb] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Design Assistant</p>
                <p className="text-[10px] text-white/50">Gemini 3.8 Flash · edits your site live</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Wand2 className="w-8 h-8 mx-auto text-accent mb-3" />
                <p className="text-sm font-semibold text-black">How can I help with your design?</p>
                <p className="text-xs text-black/50 mt-1 mb-4">Ask me to change colors, fonts, sizing or mood.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-accent text-white rounded-br-sm"
                      : m.isError
                      ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
                      : "bg-white text-black border border-[#e5e7eb] rounded-bl-sm"
                  }`}
                >
                  {m.content}
                  {m.changes?.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-[#e5e7eb] pt-2">
                      {m.changes.map((c, j) => (
                        <li key={j} className="text-xs flex items-start gap-1.5 text-black/70">
                          <Check className="w-3 h-3 text-green-600 mt-0.5 shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {working && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#e5e7eb] rounded-2xl rounded-bl-sm px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" /> Understanding your request…
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" /> Generating design changes…
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/40">
                    <Wand2 className="w-3.5 h-3.5" /> Applying to your site…
                  </div>
                </div>
              </div>
            )}

            {lastChange && !working && (
              <div className="flex justify-center">
                <button
                  onClick={undo}
                  className="text-[11px] uppercase tracking-[0.15em] text-black/50 hover:text-black flex items-center gap-1.5 border border-[#e5e7eb] rounded-full px-3 py-1.5 bg-white"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo last change
                </button>
              </div>
            )}

            {error && !working && (
              <p className="text-[11px] text-center text-black/40 px-4">
                Backend functions need integration credits to run. This is a workspace billing limit — it resets on 2026-10-10 or with a plan upgrade.
              </p>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && !working && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send({ preventDefault: () => {} }, s)}
                  className="text-[11px] border border-[#e5e7eb] rounded-full px-2.5 py-1 text-black/60 hover:border-accent hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={send} className="p-3 border-t border-[#e5e7eb] flex gap-2 shrink-0 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. make the accent emerald green"
              className="flex-1 border border-[#e5e7eb] rounded-full px-4 py-2.5 text-sm focus:border-accent outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || working}
              className="bg-accent text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
              aria-label="Send"
            >
              {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}