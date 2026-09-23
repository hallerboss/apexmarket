import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const VALID_FONTS = ["Inter", "Inter Tight", "Source Serif 4", "Poppins", "Playfair Display", "Roboto", "Montserrat", "Lato", "Oswald", "Merriweather", "Raleway", "Nunito"];

function pickColor(v) {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(t) ? t.slice(0, 9) : undefined;
}

function pickFont(v) {
  return typeof v === "string" && VALID_FONTS.includes(v) ? v : undefined;
}

function pickRadius(v) {
  const n = parseFloat(v);
  if (!Number.isFinite(n) || n < 0 || n > 3) return undefined;
  return `${n}rem`;
}

function sanitizeTheme(raw) {
  if (!raw || typeof raw !== "object") return undefined;
  const o = {};
  const set = (k, v) => { if (v !== undefined) o[k] = v; };
  set("accent", pickColor(raw.accent));
  set("background", pickColor(raw.background));
  set("foreground", pickColor(raw.foreground));
  set("primary", pickColor(raw.primary));
  set("card", pickColor(raw.card));
  set("fontHeading", pickFont(raw.fontHeading));
  set("fontBody", pickFont(raw.fontBody));
  set("radius", pickRadius(raw.radius));
  return Object.keys(o).length ? o : undefined;
}

function safeParse(str) {
  try { return JSON.parse(str); } catch { return {}; }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.slice(0, 1500).trim() : "";
    if (!message) {
      return Response.json({ error: "A message is required." }, { status: 400 });
    }
    const currentTheme = body.currentTheme && typeof body.currentTheme === "object" ? body.currentTheme : {};

    const settings = await base44.entities.SiteSetting.list();
    const themeRow = settings.find((s) => s.key === "theme");
    const existing = themeRow?.value ? safeParse(themeRow.value) : {};
    const merged = { ...existing, ...currentTheme };

    const instructions = [
      "You are the AI design assistant for ApexMarket, a premium e-commerce store.",
      "The user describes a visual change (colors, fonts, sizing, mood, spacing) and you translate it into concrete design-token changes that are applied live to the website.",
      "",
      "Design tokens you control:",
      '- accent (hex) — primary buttons, links, highlights. e.g. "#3b6bff"',
      '- background (hex) — page background. e.g. "#f7f7f2"',
      '- foreground (hex) — main text color. e.g. "#0d0d0d"',
      '- primary (hex) — solid button / strong surfaces. e.g. "#0d0d0d"',
      '- card (hex) — card surfaces. e.g. "#ffffff"',
      '- fontHeading (one of: Inter, Inter Tight, Source Serif 4, Poppins, Playfair Display, Roboto, Montserrat, Lato, Oswald, Merriweather, Raleway, Nunito)',
      '- fontBody (same list as fontHeading)',
      '- radius (a string like "0.25rem" — between 0rem and 3rem)',
      "",
      "Rules:",
      "- Return ONLY the tokens that should change. Omit any token you are not changing.",
      "- Colors must be valid hex. Keep contrast accessible (foreground on background).",
      "- Keep the aesthetic premium and cohesive — do not clash colors.",
      "- If the request is unrelated to styling, still reply helpfully and return an empty theme object.",
      "",
      'Return JSON: { "theme": { ...tokens... }, "reply": "one short sentence to the user", "changes": ["bullet", "bullet"] }',
    ].join("\n");

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${instructions}\n\nCurrent theme: ${JSON.stringify(merged)}\n\nUser request: ${message}`,
      model: "gemini_3_8_flash",
      response_json_schema: {
        type: "object",
        properties: {
          theme: { type: "object", additionalProperties: { type: "string" } },
          reply: { type: "string" },
          changes: { type: "array", items: { type: "string" } },
        },
        required: ["reply"],
      },
    });

    const data = typeof result === "object" && result !== null ? result : {};
    const patch = sanitizeTheme(data.theme) || {};
    const nextTheme = { ...merged, ...patch };

    const value = JSON.stringify(nextTheme);
    if (themeRow) {
      await base44.entities.SiteSetting.update(themeRow.id, { value });
    } else {
      await base44.entities.SiteSetting.create({ key: "theme", value });
    }

    return Response.json({
      reply: typeof data.reply === "string" ? data.reply.slice(0, 600) : "Done.",
      theme: nextTheme,
      changes: Array.isArray(data.changes) ? data.changes.slice(0, 10) : [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}