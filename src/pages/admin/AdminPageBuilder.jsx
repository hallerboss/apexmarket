import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import {
  GripVertical, Trash2, Copy, Sparkles, Loader2, Plus, FolderOpen, Wand2, LayoutGrid, X,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { WIDGET_LIBRARY, createBlock, widgetLabel } from "@/lib/pageBlocks";
import BlockRenderer from "@/components/store/BlockRenderer";
import BlockSettings from "@/components/admin/builder/BlockSettings";
import WidgetPanel from "@/components/admin/builder/WidgetPanel";
import BuilderTopBar from "@/components/admin/builder/BuilderTopBar";
import { Field, ImageField } from "@/components/admin/builder/BuilderFields";

const DEVICE_WIDTH = { desktop: "100%", tablet: "768px", mobile: "390px" };

export default function AdminPageBuilder() {
  const [pages, setPages] = useState([]);
  const [pageId, setPageId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [showWidgets, setShowWidgets] = useState(true);
  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRef, setAiRef] = useState("");
  const [generating, setGenerating] = useState(false);

  const refresh = () => base44.entities.Page.list("-created_date", 100).then(setPages).catch(() => {});

  useEffect(() => { refresh(); }, []);

  const loadPage = (id) => {
    setPageId(id);
    setSelectedId(null);
    setSaved(false);
    if (!id) { setTitle(""); setSlug(""); setStatus("draft"); setBlocks([]); return; }
    const p = pages.find((x) => x.id === id);
    if (p) {
      setTitle(p.title || "");
      setSlug(p.slug || "");
      setStatus(p.status || "draft");
      setBlocks(p.blocks || []);
    }
  };

  const newPage = () => {
    setPageId("");
    setTitle("");
    setSlug("");
    setStatus("draft");
    setBlocks([]);
    setSelectedId(null);
    setSaved(false);
  };

  const addBlock = (type) => {
    const b = createBlock(type);
    setBlocks((prev) => {
      const next = [...prev];
      const idx = prev.findIndex((x) => x.id === selectedId);
      next.splice(idx >= 0 ? idx + 1 : next.length, 0, b);
      return next;
    });
    setSelectedId(b.id);
  };

  const updateBlock = (b) => setBlocks((prev) => prev.map((x) => (x.id === b.id ? b : x)));

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((x) => x.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const duplicateBlock = (id) => {
    const src = blocks.find((b) => b.id === id);
    if (!src) return;
    const copy = { ...JSON.parse(JSON.stringify(src)), id: createBlock(src.type).id };
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(next.findIndex((b) => b.id === id) + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  };

  const moveBlock = (id, dir) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [m] = next.splice(i, 1);
      next.splice(j, 0, m);
      return next;
    });
  };

  useEffect(() => {
    if (!selectedId) return;
    const handler = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.key === "ArrowUp") { e.preventDefault(); moveBlock(selectedId, -1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); moveBlock(selectedId, 1); }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteBlock(selectedId); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") { e.preventDefault(); duplicateBlock(selectedId); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === "widgets") {
      if (destination.droppableId !== "canvas") return;
      const type = draggableId.replace(/^w_/, "");
      if (!WIDGET_LIBRARY.some((w) => w.type === type)) return;
      const b = createBlock(type);
      setBlocks((prev) => {
        const next = [...prev];
        next.splice(destination.index, 0, b);
        return next;
      });
      setSelectedId(b.id);
      return;
    }

    const items = Array.from(blocks);
    const [moved] = items.splice(source.index, 1);
    items.splice(destination.index, 0, moved);
    setBlocks(items);
  };

  const save = async () => {
    if (!title.trim()) { alert("Give the page a title first."); return; }
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        slug: (slug.trim() || title.trim().toLowerCase().replace(/\s+/g, "-")).replace(/^-+|-+$/g, ""),
        blocks,
        builder_mode: true,
        status: "published",
      };
      if (pageId) await base44.entities.Page.update(pageId, data);
      else { const created = await base44.entities.Page.create(data); setPageId(created.id); }
      setSlug(data.slug);
      setStatus("published");
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generatePageBlocks", {
        prompt: aiPrompt.trim(),
        referenceImageUrl: aiRef || undefined,
        currentBlocks: blocks,
      });
      const next = res.data?.blocks || [];
      if (next.length) { setBlocks(next); setSelectedId(next[0].id); }
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const selected = blocks.find((b) => b.id === selectedId) || null;

  return (
    <div>
      <BuilderTopBar
        title={title}
        onTitleChange={setTitle}
        status={status}
        onNew={newPage}
        device={device}
        onDevice={setDevice}
        showWidgets={showWidgets}
        onToggleWidgets={() => setShowWidgets((v) => !v)}
        slug={slug}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col xl:flex-row gap-0 border border-[#e5e7eb] bg-[#f0f0f1]">
          {showWidgets && <WidgetPanel onAdd={addBlock} onClose={() => setShowWidgets(false)} />}

          {/* Canvas */}
          <div className="flex-1 min-w-0 p-4 lg:p-6 overflow-x-auto">
            <div
              style={{ maxWidth: DEVICE_WIDTH[device] }}
              className="mx-auto bg-white shadow-sm min-h-[520px]"
            >
              <Droppable droppableId="canvas">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="builder-canvas">
                    {blocks.length === 0 && (
                      <div className="border-2 border-dashed border-[#d1d5db] m-6 py-24 text-center">
                        <div className="flex items-center justify-center gap-4 text-[#c4c8cf] mb-5">
                          <Plus className="w-5 h-5" />
                          <FolderOpen className="w-5 h-5" />
                          <Wand2 className="w-5 h-5" />
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-muted-foreground">Drag widget here</p>
                      </div>
                    )}

                    {blocks.map((b, i) => (
                      <Draggable key={b.id} draggableId={b.id} index={i}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            onClick={() => setSelectedId(b.id)}
                            className={`relative group border-b transition-colors ${
                              selectedId === b.id ? "border-accent ring-2 ring-accent/40" : "border-transparent hover:border-accent/30"
                            }`}
                          >
                            <div className={`absolute top-1 right-1 z-10 flex items-center gap-0.5 bg-accent text-white px-1.5 py-1 transition-opacity ${
                              selectedId === b.id ? "opacity-100" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                            }`}>
                              <span className="cursor-grab px-1 text-[10px] uppercase tracking-[0.1em] flex items-center gap-1">
                                <GripVertical className="w-3 h-3" /> {widgetLabel(b.type)}
                              </span>
                              <button type="button" onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }} className="p-1 hover:bg-black/20" title="Move up">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }} className="p-1 hover:bg-black/20" title="Move down">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id); }} className="p-1 hover:bg-black/20" title="Duplicate">
                                <Copy className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }} className="p-1 hover:bg-black/20" title="Delete">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="pointer-events-none">
                              <BlockRenderer block={b} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="mx-auto mt-4 flex items-center justify-center gap-3 text-[11px] text-muted-foreground" style={{ maxWidth: DEVICE_WIDTH[device] }}>
              <span>{blocks.length} widget{blocks.length === 1 ? "" : "s"}</span>
              <span>·</span>
              <span className="capitalize">{device} preview</span>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full xl:w-[320px] shrink-0 bg-white border-t xl:border-t-0 xl:border-l border-[#e5e7eb] p-4 space-y-5">
            {selected ? (
              <BlockSettings block={selected} onChange={updateBlock} onDelete={() => deleteBlock(selected.id)} />
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Page</p>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Edit an existing page</label>
                  <select value={pageId} onChange={(e) => loadPage(e.target.value)} className="admin-input text-sm">
                    <option value="">— New page —</option>
                    {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <Field label="Page title">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input text-sm" placeholder="e.g. Summer Lookbook" />
                </Field>
                <Field label="URL slug">
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} className="admin-input text-sm" placeholder="summer-lookbook" />
                </Field>
                <p className="text-[11px] text-muted-foreground">Select a widget on the canvas to edit its content and style.</p>
              </div>
            )}

            <div className="border-t border-[#eef0f2] pt-4">
              <button
                type="button"
                onClick={() => setShowAi((v) => !v)}
                className="w-full flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
              >
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-accent" /> AI Assistant</span>
                {showAi ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              {showAi && (
                <div className="space-y-3 mt-4">
                  <p className="text-[11px] text-muted-foreground">Describe the page — or upload a screenshot of a design you like and ask to match its style.</p>
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Build a landing page with a big hero, warm colors and a featured product grid"
                    className="admin-input text-sm resize-none"
                  />
                  <ImageField label="Reference design (optional)" value={aiRef} onChange={setAiRef} />
                  <button
                    type="button"
                    onClick={generate}
                    disabled={generating || !aiPrompt.trim()}
                    className="w-full bg-yellow-400 text-black px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? "Generating…" : "Generate Page"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}