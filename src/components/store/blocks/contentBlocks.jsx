import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Truck, ShieldCheck, RotateCcw, Heart, Phone, Mail, Check } from "lucide-react";

const FONT = { heading: "font-heading", body: "font-body", serif: "font-serif" };
const HEAD = { sm: "text-xl", md: "text-2xl", lg: "text-3xl", xl: "text-4xl", "2xl": "text-5xl" };
const BODY = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl" };

export const ICON_SET = {
  star: Star,
  truck: Truck,
  shield: ShieldCheck,
  refresh: RotateCcw,
  heart: Heart,
  phone: Phone,
  mail: Mail,
  check: Check,
};

function Heading({ block }) {
  return (
    <h2
      className={`${FONT[block.fontFamily || "heading"]} ${HEAD[block.fontSize || "lg"]} font-bold leading-tight`}
      style={{ color: block.color || undefined }}
    >
      {block.text}
    </h2>
  );
}

function Text({ block }) {
  const align = block.align || "left";
  return (
    <p
      className={`${FONT[block.fontFamily || "serif"]} ${BODY[block.fontSize || "md"]} leading-relaxed max-w-3xl ${align === "center" ? "mx-auto" : ""}`}
      style={{ color: block.color || undefined }}
    >
      {block.text}
    </p>
  );
}

function Button({ block }) {
  return (
    <Link
      to={block.href || "#"}
      className="btn-mono inline-flex"
      style={{ background: block.bgColor || "#111111", color: block.textColor || "#ffffff" }}
    >
      {block.label}
    </Link>
  );
}

function Divider({ block }) {
  return <hr className="border-t" style={{ borderColor: block.color || undefined }} />;
}

function List({ block }) {
  return (
    <div className="max-w-2xl">
      {block.title && <h3 className="display-text text-xl mb-4">{block.title}</h3>}
      <ul className={`space-y-2 ${FONT[block.fontFamily || "body"]} ${BODY[block.fontSize || "md"]}`}>
        {(block.items || []).map((item, i) => (
          <li key={i} className="flex items-start gap-2.5" style={{ color: block.textColor || undefined }}>
            <Check className="w-4 h-4 mt-1 shrink-0 text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconBox({ block }) {
  const Icon = ICON_SET[block.icon] || Star;
  return (
    <div className="max-w-sm mx-auto">
      <div className="w-12 h-12 bg-accent/10 text-accent flex items-center justify-center mb-4 mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="display-text text-xl mb-2">{block.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{block.text}</p>
    </div>
  );
}

function Counter({ block }) {
  const items = block.items || [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {items.map((it, i) => (
        <div key={i}>
          <p className="display-text text-4xl lg:text-5xl mb-1" style={{ color: block.textColor || undefined }}>{it.value}</p>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{it.label}</p>
        </div>
      ))}
    </div>
  );
}

function useCountdown(date) {
  const [left, setLeft] = useState(() => (date ? new Date(date).getTime() - Date.now() : 0));
  useEffect(() => {
    if (!date) return undefined;
    const tick = () => setLeft(new Date(date).getTime() - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [date]);
  return left;
}

function Countdown({ block }) {
  const left = useCountdown(block.date);
  if (!block.date) {
    return <p className="text-sm text-muted-foreground">Pick a target date in the block settings to start the countdown.</p>;
  }
  const total = Math.max(0, left);
  const units = [
    { label: "Days", value: Math.floor(total / 86400000) },
    { label: "Hours", value: Math.floor((total / 3600000) % 24) },
    { label: "Minutes", value: Math.floor((total / 60000) % 60) },
    { label: "Seconds", value: Math.floor((total / 1000) % 60) },
  ];
  return (
    <div>
      {block.title && <h3 className="display-text text-2xl lg:text-3xl mb-6" style={{ color: block.textColor || undefined }}>{block.title}</h3>}
      <div className="flex flex-wrap justify-center gap-3">
        {units.map((u) => (
          <div key={u.label} className="w-20 border border-border bg-card py-3">
            <p className="display-text text-2xl" style={{ color: block.textColor || undefined }}>{String(u.value).padStart(2, "0")}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] opacity-70" style={{ color: block.textColor || undefined }}>{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CONTENT_BLOCKS = {
  heading: Heading,
  text: Text,
  button: Button,
  divider: Divider,
  list: List,
  iconBox: IconBox,
  counter: Counter,
  countdown: Countdown,
};