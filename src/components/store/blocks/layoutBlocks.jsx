import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

function CallToAction({ block }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="display-text text-3xl lg:text-5xl mb-4">{block.title}</h2>
      {block.subtitle && <p className="text-base lg:text-lg opacity-80 mb-8">{block.subtitle}</p>}
      {block.ctaText && (
        <Link to={block.ctaHref || "/shop"} className="btn-mono bg-accent text-white">
          {block.ctaText}
        </Link>
      )}
    </div>
  );
}

function Timeline({ block }) {
  return (
    <div className="max-w-2xl mx-auto">
      {block.title && <h3 className="display-text text-3xl mb-10">{block.title}</h3>}
      <div className="relative border-l border-border pl-8 space-y-10">
        {(block.items || []).map((it, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-[38px] top-1.5 w-3 h-3 rounded-full bg-accent" />
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent mb-1">{it.date}</p>
            <p className="font-semibold mb-1">{it.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tabs({ block }) {
  const items = block.items || [];
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const current = items[Math.min(active, items.length - 1)];
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap border-b border-border">
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
              i === active ? "text-foreground border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {it.title}
          </button>
        ))}
      </div>
      <p className="pt-6 text-sm lg:text-base text-muted-foreground leading-relaxed">{current?.text}</p>
    </div>
  );
}

function NavAnchor({ block }) {
  return <span id={block.anchor || undefined} className="block scroll-mt-24" />;
}

function Popup({ block }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-mono bg-foreground text-background">
        {block.buttonLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border max-w-md w-full p-8 text-center">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <h3 className="display-text text-2xl mb-3">{block.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{block.text}</p>
            <Link to="/shop" className="btn-mono bg-accent text-white">Shop now</Link>
          </div>
        </div>
      )}
    </>
  );
}

export const LAYOUT_BLOCKS = {
  cta: CallToAction,
  timeline: Timeline,
  tabs: Tabs,
  navAnchor: NavAnchor,
  popup: Popup,
};