import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const BLOCK_TYPES = ["heading", "text", "button", "image", "hero", "products", "divider", "spacer"];
const FONTS = ["heading", "body", "serif"];
const ALIGNS = ["left", "center", "right"];
const PADS = ["none", "sm", "md", "lg", "xl"];
const SIZES = ["sm", "md", "lg", "xl", "2xl"];
const HEIGHTS = ["sm", "md", "lg", "xl"];

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

function sanitizeBlocks(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  raw.slice(0, 30).forEach((b, i) => {
    if (!b || typeof b !== "object") return;
    const type = pickEnum(b.type, BLOCK_TYPES);
    if (!type) return;

    const block = { id: `b_ai_${Date.now().toString(36)}_${i}`, type };
    const set = (k, v) => { if (v !== undefined) block[k] = v; };

    if (type === "heading") {
      set("text", pickString(b.text, 300) || "Headline");
      set("fontFamily", pickEnum(b.fontFamily, FONTS));
      set("fontSize", pickEnum(b.fontSize, SIZES));
      set("color", pickColor(b.color));
    }
    if (type === "text") {
      set("text", pickString(b.text, 2000) || "Text");
      set("fontFamily", pickEnum(b.fontFamily, FONTS));
      set("fontSize", pickEnum(b.fontSize, SIZES));
      set("color", pickColor(b.color));
    }
    if (type === "button") {
      set("label", pickString(b.label, 40) || "Learn more");
      set("href", pickString(b.href, 300) || "/shop");
      set("bgColor", pickColor(b.bgColor));
      set("textColor", pickColor(b.textColor));
    }
    if (type === "image") {
      set("url", pickString(b.url, 1000));
      set("alt", pickString(b.alt, 200));
      set("height", pickEnum(b.height, HEIGHTS));
    }
    if (type === "hero") {
      set("title", pickString(b.title, 200) || "Headline");
      set("subtitle", pickString(b.subtitle, 300));
      set("image", pickString(b.image, 1000));
      set("ctaText", pickString(b.ctaText, 40));
      set("ctaHref", pickString(b.ctaHref, 300));
      set("height", pickEnum(b.height, HEIGHTS));
    }
    if (type === "products") {
      set("title", pickString(b.title, 120));
      set("category", pickString(b.category, 80));
      set("limit", pickNumber(b.limit, 2, 12));
      set("columns", pickNumber(b.columns, 2, 4));
    }
    if (type === "divider") set("color", pickColor(b.color));
    if (type === "spacer") set("height", pickEnum(b.height, HEIGHTS));

    set("align", pickEnum(b.align, ALIGNS));
    set("pad", pickEnum(b.pad, PADS));
    if (block.bgColor === undefined) set("bgColor", pickColor(b.bgColor));
    set("textColor", pickColor(b.textColor));

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
      "- text: { text, fontFamily, fontSize (up to \"xl\"), color (hex) }",
      '- button: { label, href (e.g. "/shop"), bgColor (hex), textColor (hex) }',
      "- image: { url, alt, height: \"sm\"|\"md\"|\"lg\"|\"xl\" }",
      "- hero: { title, subtitle, image, ctaText, ctaHref, height }",
      '- products: { title, category (a real store category, or "" for all), limit (2-12), columns (2-4) }',
      "- divider: { color }",
      '- spacer: { height }',
      'Every block may also carry: align ("left"|"center"|"right") and pad ("none"|"sm"|"md"|"lg"|"xl").',
      "",
      "Rules:",
      "- Return 3 to 8 blocks that form a complete, well-structured page.",
      "- NEVER invent image URLs. Only include an image or url field when an image URL is supplied to you. Otherwise omit those fields.",
      "- Colors must be valid CSS hex values such as \"#111111\". Prefer a restrained, premium palette.",
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