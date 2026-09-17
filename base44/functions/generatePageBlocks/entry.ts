import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const BLOCK_TYPES = [
  "heading", "text", "button", "image", "hero", "products", "divider", "spacer",
  "list", "iconBox", "counter", "countdown", "pricing", "menuPrice", "megamenu",
  "sidebar", "testimonials", "team", "contactForm", "newsletter", "gallery",
  "video", "map", "hotspot", "social", "cta", "timeline", "tabs", "navAnchor", "popup",
];
const FONTS = ["heading", "body", "serif"];
const ALIGNS = ["left", "center", "right"];
const PADS = ["none", "sm", "md", "lg", "xl"];
const SIZES = ["sm", "md", "lg", "xl", "2xl"];
const HEIGHTS = ["sm", "md", "lg", "xl"];
const ICONS = ["star", "truck", "shield", "refresh", "heart", "phone", "mail", "check"];
const NETWORKS = ["instagram", "facebook", "x", "youtube", "tiktok", "linkedin"];

function pickString(v, max) {
  return typeof v === "string" ? v.slice(0, max) : undefined;
}

function pickEnum(v, allowed) {
  return allowed.includes(v) ? v : undefined;
}

function pickColor(v) {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(t)) return t.slice(0, 9);
  if (/^rgba?\([\d\s.,%]+\)$/i.test(t)) return t.slice(0, 40);
  if (/^[a-zA-Z]{3,20}$/.test(t)) return t;
  return undefined;
}

function pickNumber(v, min, max) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : undefined;
}

function pickDate(v) {
  if (typeof v !== "string" || !v.trim()) return undefined;
  const t = v.trim();
  return Number.isNaN(new Date(t).getTime()) ? undefined : t.slice(0, 40);
}

// Keep only the listed keys, each truncated to its max length.
function items(raw, spec, limit) {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.slice(0, limit).map((it) => {
    if (!it || typeof it !== "object") return null;
    const o = {};
    Object.entries(spec).forEach(([k, max]) => {
      const v = pickString(it[k], max);
      if (v !== undefined && v !== "") o[k] = v;
    });
    return Object.keys(o).length ? o : null;
  }).filter(Boolean);
  return out.length ? out : undefined;
}

function stringList(raw, limit, max) {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.slice(0, limit).map((v) => pickString(v, max)).filter((v) => v && v.trim());
  return out.length ? out : undefined;
}

function sanitizeBlocks(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  raw.slice(0, 30).forEach((b, i) => {
    if (!b || typeof b !== "object") return;
    const type = pickEnum(b.type, BLOCK_TYPES);
    if (!type) return;

    const block = { id: `b_ai_${Date.now().toString(36)}_${i}`, type };
    const set = (k, v) => { if (v !== undefined) block[k] = v; };

    if (type === "heading" || type === "text") {
      set("text", pickString(b.text, type === "heading" ? 300 : 2000));
      set("fontFamily", pickEnum(b.fontFamily, FONTS));
      set("fontSize", pickEnum(b.fontSize, SIZES));
      set("color", pickColor(b.color));
    }
    if (type === "button" || type === "popup") {
      set("label", type === "button" ? pickString(b.label, 40) : undefined);
      set("buttonLabel", type === "popup" ? pickString(b.buttonLabel, 40) : undefined);
      set("href", type === "button" ? pickString(b.href, 300) : undefined);
      set("title", type === "popup" ? pickString(b.title, 140) : undefined);
      set("text", type === "popup" ? pickString(b.text, 300) : undefined);
      set("bgColor", type === "button" ? pickColor(b.bgColor) : undefined);
      set("textColor", type === "button" ? pickColor(b.textColor) : undefined);
    }
    if (type === "image") {
      set("url", pickString(b.url, 1000));
      set("alt", pickString(b.alt, 200));
      set("height", pickEnum(b.height, HEIGHTS));
    }
    if (type === "hero" || type === "cta") {
      set("title", pickString(b.title, 200));
      set("subtitle", pickString(b.subtitle, 300));
      set("ctaText", pickString(b.ctaText, 40));
      set("ctaHref", pickString(b.ctaHref, 300));
      if (type === "hero") {
        set("image", pickString(b.image, 1000));
        set("height", pickEnum(b.height, HEIGHTS));
      } else {
        set("bgColor", pickColor(b.bgColor) || "#111111");
        set("textColor", pickColor(b.textColor) || "#ffffff");
      }
    }
    if (type === "products") {
      set("title", pickString(b.title, 120));
      set("category", pickString(b.category, 80));
      set("limit", pickNumber(b.limit, 2, 12));
      set("columns", pickNumber(b.columns, 2, 4));
    }
    if (type === "divider") set("color", pickColor(b.color));
    if (type === "spacer") set("height", pickEnum(b.height, HEIGHTS));

    if (type === "list") {
      set("title", pickString(b.title, 120));
      set("items", stringList(b.items, 10, 160));
      set("fontFamily", pickEnum(b.fontFamily, FONTS));
      set("fontSize", pickEnum(b.fontSize, SIZES));
      set("textColor", pickColor(b.textColor));
    }
    if (type === "iconBox") {
      set("icon", pickEnum(b.icon, ICONS) || "star");
      set("title", pickString(b.title, 120));
      set("text", pickString(b.text, 300));
    }
    if (type === "counter") {
      set("items", items(b.items, { value: 20, label: 60 }, 6));
      set("textColor", pickColor(b.textColor));
    }
    if (type === "countdown") {
      set("title", pickString(b.title, 120));
      set("date", pickDate(b.date));
      set("textColor", pickColor(b.textColor));
    }
    if (type === "pricing") {
      set("title", pickString(b.title, 120));
      set("plans", items(b.plans, { name: 60, price: 24, period: 24, features: 300, ctaText: 30, ctaHref: 300 }, 4));
    }
    if (type === "menuPrice") {
      set("title", pickString(b.title, 120));
      set("items", items(b.items, { name: 80, price: 24, description: 160 }, 12));
    }
    if (type === "megamenu") {
      set("title", pickString(b.title, 80));
      set("columns", pickNumber(b.columns, 2, 4));
      set("links", items(b.links, { label: 40, href: 300 }, 12));
    }
    if (type === "sidebar") {
      set("title", pickString(b.title, 80));
      set("items", stringList(b.items, 10, 60));
    }
    if (type === "testimonials") {
      set("title", pickString(b.title, 120));
      set("items", items(b.items, { quote: 400, author: 60, role: 60 }, 4));
    }
    if (type === "team") {
      set("title", pickString(b.title, 120));
      set("columns", pickNumber(b.columns, 2, 4));
      set("members", items(b.members, { name: 60, role: 60 }, 6));
    }
    if (type === "contactForm" || type === "newsletter") {
      set("title", pickString(b.title, 140));
      set("subtitle", pickString(b.subtitle, 300));
      if (type === "newsletter") {
        set("placeholder", pickString(b.placeholder, 60));
        set("buttonLabel", pickString(b.buttonLabel, 30));
        set("bgColor", pickColor(b.bgColor) || "#111111");
        set("textColor", pickColor(b.textColor) || "#ffffff");
      }
    }
    if (type === "gallery") {
      set("title", pickString(b.title, 120));
      set("columns", pickNumber(b.columns, 2, 4));
      set("height", pickEnum(b.height, HEIGHTS));
    }
    if (type === "video") {
      set("url", pickString(b.url, 1000));
      set("title", pickString(b.title, 200));
    }
    if (type === "map") {
      set("address", pickString(b.address, 200));
      set("height", pickEnum(b.height, HEIGHTS));
    }
    if (type === "social") {
      set("title", pickString(b.title, 80));
      const links = Array.isArray(b.links)
        ? b.links.slice(0, 6).map((l) => {
          const network = pickEnum(l?.network, NETWORKS);
          return network ? { network, ...(l.href ? { href: pickString(l.href, 300) } : {}) } : null;
        }).filter(Boolean)
        : [];
      if (links.length) set("links", links);
    }
    if (type === "timeline") {
      set("title", pickString(b.title, 120));
      set("items", items(b.items, { date: 24, title: 80, text: 300 }, 6));
    }
    if (type === "tabs") set("items", items(b.items, { title: 40, text: 600 }, 5));
    if (type === "navAnchor") set("anchor", pickString(b.anchor, 60));

    set("align", pickEnum(b.align, ALIGNS));
    set("pad", pickEnum(b.pad, PADS));
    if (block.bgColor === undefined) set("bgColor", pickColor(b.bgColor));
    if (block.textColor === undefined) set("textColor", pickColor(b.textColor));

    out.push(block);
  });
  return out;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body.prompt === "string" ? body.prompt.slice(0, 1500).trim() : "";
    if (!prompt) {
      return Response.json({ error: "A page description is required." }, { status: 400 });
    }
    const referenceImageUrl = typeof body.referenceImageUrl === "string" ? body.referenceImageUrl.slice(0, 1000) : "";
    const currentBlocks = Array.isArray(body.currentBlocks) ? body.currentBlocks.slice(0, 30) : [];

    const instructions = [
      "You are a page-layout designer for ApexMarket, a premium e-commerce store.",
      "Design a page as an ordered list of content blocks and return it as JSON.",
      "",
      "Available block types and their properties:",
      '- heading: { text, fontFamily: "heading"|"body"|"serif", fontSize: "md"|"lg"|"xl"|"2xl", color (hex) }',
      "- text: { text, fontFamily, fontSize, color (hex) }",
      '- button: { label, href (e.g. "/shop"), bgColor (hex), textColor (hex) }',
      '- hero: { title, subtitle, ctaText, ctaHref, height: "sm"|"md"|"lg"|"xl" }',
      '- products: { title, category (a real store category, or "" for all), limit (2-12), columns (2-4) }',
      '- list: { title, items: [string] }',
      '- iconBox: { icon: "star"|"truck"|"shield"|"refresh"|"heart"|"phone"|"mail"|"check", title, text }',
      '- counter: { items: [{ value, label }] }',
      '- countdown: { title, date (ISO date-time) }',
      '- pricing: { title, plans: [{ name, price, period, features (comma separated), ctaText, ctaHref }] }',
      '- menuPrice: { title, items: [{ name, price, description }] }',
      '- megamenu: { title, columns, links: [{ label, href }] }',
      '- sidebar: { title, items: [string] }',
      '- testimonials: { title, items: [{ quote, author, role }] }',
      '- team: { title, columns, members: [{ name, role }] }',
      '- contactForm: { title, subtitle }',
      '- newsletter: { title, subtitle, placeholder, buttonLabel, bgColor, textColor }',
      '- video: { url, title }',
      '- map: { address, height }',
      '- social: { title, links: [{ network: "instagram"|"facebook"|"x"|"youtube"|"tiktok"|"linkedin", href }] }',
      '- cta: { title, subtitle, ctaText, ctaHref, bgColor, textColor }',
      '- timeline: { title, items: [{ date, title, text }] }',
      '- tabs: { items: [{ title, text }] }',
      "- divider: { color }",
      "- spacer: { height }",
      'Every block may also carry: align ("left"|"center"|"right") and pad ("none"|"sm"|"md"|"lg"|"xl").',
      "",
      "Rules:",
      "- Return 3 to 8 blocks that form a complete, well-structured page.",
      "- NEVER invent image URLs. Only include an image or url field when an image URL is supplied to you. Otherwise omit those fields.",
      "- Colors must be valid CSS hex values such as \"#111111\". Prefer a restrained, premium palette.",
      "- Prefer a mix of richer widgets (hero, products, testimonials, cta, newsletters, counters) over plain text only.",
      "- Keep copy concise and on-brand for a modern e-commerce store.",
      "",
      'Return JSON of the form: { "blocks": [ ... ] }',
    ].join("\n");

    let fullPrompt = `${instructions}\n\nUser request: ${prompt}`;
    if (currentBlocks.length) {
      fullPrompt += `\n\nCurrent page blocks (redesign these, keep what works):\n${JSON.stringify(currentBlocks).slice(0, 4000)}`;
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: "gemini_3_8_flash",
      file_urls: referenceImageUrl ? [referenceImageUrl] : undefined,
    });

    const text = typeof result === "string" ? result : JSON.stringify(result || "");
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let parsed = null;
    if (start !== -1 && end > start) {
      try {
        parsed = JSON.parse(text.slice(start, end + 1));
      } catch {
        parsed = null;
      }
    }

    const raw = parsed && Array.isArray(parsed.blocks) ? parsed.blocks : [];
    const blocks = sanitizeBlocks(raw);

    if (!blocks.length) {
      return Response.json({ error: "The assistant could not build a page from that request. Try describing it in more detail." }, { status: 502 });
    }

    return Response.json({ blocks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}