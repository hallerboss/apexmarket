import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Search, X, Heading1, Type, MousePointerClick, List, Star, Hash, Timer, Minus, MoveVertical,
  LayoutGrid, Table, Receipt, Menu, PanelLeft, Quote, Users, Mail, Send, Presentation, Image as ImageIcon,
  Images, PlayCircle, MapPin, Crosshair, Share2, Megaphone, GitCommitHorizontal, Columns, Anchor, Square,
} from "lucide-react";
import { WIDGET_LIBRARY, WIDGET_GROUPS } from "@/lib/pageBlocks";

const ICONS = {
  Heading1, Type, MousePointerClick, List, Star, Hash, Timer, Minus, MoveVertical,
  LayoutGrid, Table, Receipt, Menu, PanelLeft, Quote, Users, Mail, Send, Presentation, Image: ImageIcon,
  Images, PlayCircle, MapPin, Crosshair, Share2, Megaphone, GitCommitHorizontal, Columns, Anchor, Square,
};

const GLOBAL_TYPES = ["heading", "button", "cta", "divider", "products"];

export default function WidgetPanel({ onAdd, onClose }) {
  const [tab, setTab] = useState("widgets");
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");

  const base = tab === "globals" ? WIDGET_LIBRARY.filter((w) => GLOBAL_TYPES.includes(w.type)) : WIDGET_LIBRARY;
  const items = base.filter(
    (w) => (group === "all" || w.group === group || tab === "globals") && w.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <aside className="builder-dark w-[300px] shrink-0 bg-[#1a1a1c] border-r border-[#333333] flex flex-col max-h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between px-4 h-11 border-b border-[#333333] shrink-0">
        <span className="text-[11px] uppercase tracking-[0.2em] bd-muted">Elements</span>
        <button type="button" onClick={onClose} className="bd-muted hover:bd-accent">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-[#333333] shrink-0">
        {[{ id: "widgets", label: "Widgets" }, { id: "globals", label: "Globals" }].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors ${
              tab === t.id ? "text-white border-b-2 border-[#ff59e7]" : "bd-muted hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-3 border-b border-[#333333] shrink-0">
        <div className="flex items-center gap-2 border border-[#333333] bg-[#202024] px-3 py-2">
          <Search className="w-3.5 h-3.5 bd-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Widget..."
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-[#6b6b73]"
          />
        </div>
      </div>

      {tab === "widgets" && (
        <div className="flex flex-wrap gap-1.5 px-3 py-3 border-b border-[#333333] shrink-0">
          <button
            type="button"
            onClick={() => setGroup("all")}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] border transition-colors ${
              group === "all" ? "border-[#ff59e7] bd-accent" : "border-[#333333] bd-muted hover:text-white"
            }`}
          >
            All
          </button>
          {WIDGET_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] border transition-colors ${
                group === g.id ? "border-[#ff59e7] bd-accent" : "border-[#333333] bd-muted hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      <Droppable droppableId="widgets">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {items.map((w, i) => {
                const Icon = ICONS[w.icon] || Square;
                return (
                  <Draggable key={w.type} draggableId={`w_${w.type}`} index={i}>
                    {(prov) => (
                      <button
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        type="button"
                        onClick={() => onAdd(w.type)}
                        className="flex flex-col items-center justify-center gap-2 border border-[#333333] bg-[#202024] px-2 py-4 hover:border-[#ff59e7] hover:bg-[#26262b] transition-colors cursor-grab active:cursor-grabbing"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] text-center leading-tight">{w.label}</span>
                      </button>
                    )}
                  </Draggable>
                );
              })}
            </div>
            {provided.placeholder}
            {!items.length && <p className="text-xs bd-muted text-center py-8">No widgets match that search.</p>}
          </div>
        )}
      </Droppable>

      <div className="px-4 py-3 border-t border-[#333333] shrink-0">
        <p className="text-[10px] bd-muted">Drag a widget onto the canvas, or click to add it.</p>
      </div>
    </aside>
  );
}