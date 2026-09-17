import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Quote, Send, Mail, Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import BlockProductGrid from "@/components/store/BlockProductGrid";

const MENU_COL = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" };

function Products({ block }) {
  return (
    <div>
      {block.title && <h2 className="display-text text-3xl lg:text-4xl mb-8">{block.title}</h2>}
      <BlockProductGrid category={block.category} limit={block.limit || 4} columns={block.columns || 4} />
    </div>
  );
}

function Pricing({ block }) {
  const plans = block.plans || [];
  return (
    <div>
      {block.title && <h3 className="display-text text-3xl lg:text-4xl mb-10">{block.title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <div key={i} className="border border-border bg-card p-8 flex flex-col">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3">{p.name}</p>
            <p className="display-text text-4xl mb-4">
              {p.price}<span className="text-base font-normal text-muted-foreground">{p.period}</span>
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {String(p.features || "").split(",").map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" /> {f.trim()}
                </li>
              ))}
            </ul>
            <Link to={p.ctaHref || "#"} className="btn-mono bg-foreground text-background self-start">{p.ctaText}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuPrice({ block }) {
  return (
    <div className="max-w-2xl mx-auto">
      {block.title && <h3 className="display-text text-3xl mb-8">{block.title}</h3>}
      <div className="space-y-5">
        {(block.items || []).map((it, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-3">
              <span className="font-semibold">{it.name}</span>
              <span className="flex-1 border-b border-dotted border-border" />
              <span className="font-semibold">{it.price}</span>
            </div>
            {it.description && <p className="text-xs text-muted-foreground mt-1">{it.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MegaMenu({ block }) {
  const cols = block.columns || 3;
  return (
    <div className="border border-border bg-card p-8">
      {block.title && <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-6">{block.title}</p>}
      <div className={`grid ${MENU_COL[cols] || MENU_COL[3]} gap-x-8 gap-y-3`}>
        {(block.links || []).map((l, i) => (
          <Link key={i} to={l.href || "/shop"} className="text-sm hover:text-accent transition-colors">{l.label}</Link>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ block }) {
  return (
    <div className="max-w-xs border border-border bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">{block.title}</p>
      <ul className="space-y-2.5">
        {(block.items || []).map((it, i) => (
          <li key={i}>
            <Link to={`/shop?category=${encodeURIComponent(it)}`} className="text-sm text-muted-foreground hover:text-accent transition-colors">{it}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Testimonials({ block }) {
  return (
    <div>
      {block.title && <h3 className="display-text text-3xl lg:text-4xl mb-10">{block.title}</h3>}
      <div className="grid md:grid-cols-3 gap-6">
        {(block.items || []).map((t, i) => (
          <div key={i} className="border border-border bg-card p-7">
            <Quote className="w-6 h-6 text-accent mb-4" />
            <p className="serif-text text-lg leading-relaxed mb-5">{t.quote}</p>
            <p className="text-sm font-semibold">{t.author}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Team({ block }) {
  const cols = block.columns || 3;
  return (
    <div>
      {block.title && <h3 className="display-text text-3xl lg:text-4xl mb-10">{block.title}</h3>}
      <div className={`grid ${MENU_COL[cols] || MENU_COL[3]} gap-6`}>
        {(block.members || []).map((m, i) => (
          <div key={i} className="text-center">
            {m.image ? (
              <Image src={m.image} alt={m.name} className="w-full aspect-[3/4] mb-4" fittingType="fill" />
            ) : (
              <div className="w-full aspect-[3/4] bg-secondary mb-4" />
            )}
            <p className="font-semibold text-sm">{m.name}</p>
            <p className="text-xs text-muted-foreground">{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactForm({ block }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    setState("sending");
    try {
      await base44.functions.invoke("sendContactInquiry", {
        name: form.name,
        email: form.email,
        subject: block.title || "Website enquiry",
        message: form.message,
      });
      setState("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="max-w-xl mx-auto border border-accent/30 bg-accent/5 p-8 text-center">
        <Check className="w-6 h-6 text-accent mx-auto mb-3" />
        <p className="font-semibold">Thanks — your message is on its way.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {block.title && <h3 className="display-text text-3xl mb-3">{block.title}</h3>}
      {block.subtitle && <p className="text-sm text-muted-foreground mb-8">{block.subtitle}</p>}
      <form onSubmit={submit} className="space-y-3 text-left">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full border border-border bg-card px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full border border-border bg-card px-4 py-3 text-sm focus:border-accent focus:outline-none" />
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" className="w-full border border-border bg-card px-4 py-3 text-sm focus:border-accent focus:outline-none resize-none" />
        <button type="submit" disabled={state === "sending"} className="btn-mono bg-foreground text-background disabled:opacity-50">
          {state === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send message
        </button>
        {state === "error" && <p className="text-xs text-red-500">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
}

function Newsletter({ block }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    setState("sending");
    try {
      await base44.functions.invoke("sendContactInquiry", {
        name: email.split("@")[0] || "Subscriber",
        email,
        subject: "Newsletter signup",
        message: `Please add ${email} to the newsletter list.`,
      });
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {block.title && <h2 className="display-text text-3xl lg:text-4xl mb-3">{block.title}</h2>}
      {block.subtitle && <p className="text-sm opacity-80 mb-8">{block.subtitle}</p>}
      {state === "done" ? (
        <p className="flex items-center justify-center gap-2 text-sm font-semibold"><Check className="w-4 h-4" /> You're on the list.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={block.placeholder || "Your email address"}
            className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm placeholder:opacity-60 focus:outline-none focus:border-white/60"
            style={{ color: block.textColor || undefined }}
          />
          <button type="submit" disabled={state === "sending"} className="btn-mono bg-accent text-white disabled:opacity-50">
            {state === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {block.buttonLabel || "Subscribe"}
          </button>
        </form>
      )}
      {state === "error" && <p className="text-xs text-red-400 mt-3">Something went wrong. Please try again.</p>}
    </div>
  );
}

export const COMMERCE_BLOCKS = {
  products: Products,
  pricing: Pricing,
  menuPrice: MenuPrice,
  megamenu: MegaMenu,
  sidebar: Sidebar,
  testimonials: Testimonials,
  team: Team,
  contactForm: ContactForm,
  newsletter: Newsletter,
};