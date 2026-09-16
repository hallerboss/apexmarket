import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, GripVertical, Sparkles, Loader2, ExternalLink, FilePlus2 } from "lucide-react";
import { BLOCK_LIBRARY, createBlock } from "@/lib/pageBlocks";
import BlockRenderer from "@/components/store/BlockRenderer";
import BlockSettings from "@/components/admin/builder/BlockSettings";
import { Field, ImageField } from "@/components/admin/builder/BuilderFields";

export default function AdminPageBuilder() {
  const [pages, setPages] = useState([]);
  const [pageId, setPageId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRef, setAiRef] = useState("");
  const [generating, setGenerating] = useState(false);

  const refresh = () => base44.entities.Page.list("-created_date", 100).then(setPages).catch(() => {});

  useEffect(() => { refresh(); }, []);

  const loadPage = (id) => {
    setPageId(id);
    setSelectedId(null);
    if (!id) { setTitle(""); setSlug(""); setBlocks([]); return; }
    const p = pages.find((x) => x.id === id);
    if (p) { setTitle(p.title || ""); setSlug(p.slug || ""); setBlocks(p.blocks || []); }
  };

  const newPage = () => {
    setPageId("");
    setTitle("");
    setSlug("");
    setBlocks([]);
    setSelectedId(null);
  };

  const addBlock = (type) => {
    const b = createBlock(type);
    setBlocks((prev) => [...prev, b]);
    setSelectedId(b.id);
  };

  const updateBlock = (b) => setBlocks((prev) => prev.map((x) => (x.id === b.id ? b : x)));
  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((x) => x.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setBlocks(items);
  };

  const save = async () => {
    if (!title.trim()) { alert("Give the page a title first."); return; }
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, "-"),
        blocks,
        builder_mode: true,
        status: "published",
      };
      if (pageId) { await base44.entities.Page.update(pageId, data); }
      else { const created = await base44.entities.Page.create(data); setPageId(created.id); setSlug(data.slug); }
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="display-text text-2xl">Page Builder</h2>
          <p className="text-sm text-black/50 mt-1">Drag blocks to arrange, style them, or describe a page to the AI assistant.</p>
        </div>
        <div className="flex items-center gap-2">
          {slug && (
            <Link to={`/page/${slug}`} target="_blank" className="border border-[#e5e7eb] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#fafafa] flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </Link>
          )}
          <button onClick={save} disabled={saving} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saved ? "Saved" : "Save Page"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr_300px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          <div className="bg-white border border-[#e5e7eb] p-4 space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold">Page</h3>
            <select value={pageId} onChange={(e) => loadPage(e.target.value)} className="admin-input text-sm">
              <option value="">— New page —</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button type="button" onClick={newPage} className="text-xs text-accent flex items-center gap-1 hover:underline">
              <FilePlus2 className="w-3.5 h-3.5" /> Start a new page
            </button>
            <Field label="Page title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input text-sm" placeholder="e.g. Summer Lookbook" />
            </Field>
            <Field label="URL slug">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="admin-input text-sm" placeholder="summer-lookbook" />
            </Field>
          </div>

          <div className="bg-white border border-[#e5e7eb] p-4">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">Blocks</h3>
            <div className="grid grid-cols-2 gap-2">
              {BLOCK_LIBRARY.map((b) => (
                <button key={b.type} type="button" onClick={() => addBlock(b.type)} className="border border-[#e5e7eb] px-2 py-2.5 text-[11px] font-medium hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] p-4 space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> AI Assistant
            </h3>
            <p className="text-[11px] text-black/50">Describe the page — or upload a screenshot of a design you like and ask to match its style.</p>
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Build a landing page with a big hero, autumn colors and a featured product grid"
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
        </div>

        {/* Canvas */}
        <div className="min-w-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="canvas">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="builder-canvas space-y-3">
                  {blocks.length === 0 && (
                    <div className="border-2 border-dashed border-[#d1d5db] p-16 text-center text-sm text-muted-foreground">
                      Add a block from the left, or describe your page to the AI assistant.
                    </div>
                  )}
                  {blocks.map((b, i) => (
                    <Draggable key={b.id} draggableId={b.id} index={i}>
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          onClick={() => setSelectedId(b.id)}
                          className={`relative bg-white border transition-colors ${selectedId === b.id ? "border-accent" : "border-[#e5e7eb]"}`}
                        >
                          <div className="flex items-center justify-between px-3 py-2 border-b border-[#f0f0f0] bg-[#fafafa]">
                            <span {...prov.dragHandleProps} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground cursor-grab">
                              <GripVertical className="w-3.5 h-3.5" /> {b.type}
                            </span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }} className="text-muted-foreground hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
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
          </DragDropContext>
        </div>

        {/* Right column */}
        <div className="bg-white border border-[#e5e7eb] p-4 h-fit xl:sticky xl:top-24">
          <BlockSettings block={selected} onChange={updateBlock} onDelete={() => deleteBlock(selected.id)} />
        </div>
      </div>
    </div>
  );
}