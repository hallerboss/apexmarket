import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

function hexToHsl(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) hue = ((b - r) / d + 2) * 60;
    else hue = ((r - g) / d + 4) * 60;
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

const COLOR_TOKENS = {
  accent: "--accent",
  background: "--background",
  foreground: "--foreground",
  primary: "--primary",
  card: "--card",
};
const FONT_TOKENS = {
  fontHeading: "--font-heading",
  fontBody: "--font-body",
  fontDisplay: "--font-display",
};

function applyTokens(theme) {
  if (!theme || typeof window === "undefined") return;
  const root = document.documentElement;
  Object.entries(COLOR_TOKENS).forEach(([k, cssVar]) => {
    if (theme[k]) {
      const hsl = hexToHsl(theme[k]);
      if (hsl) root.style.setProperty(cssVar, hsl);
    }
  });
  Object.entries(FONT_TOKENS).forEach(([k, cssVar]) => {
    if (theme[k]) root.style.setProperty(cssVar, `"${theme[k]}", ui-sans-serif, system-ui, sans-serif`);
  });
  if (theme.radius) root.style.setProperty("--radius", theme.radius);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    base44.entities.SiteSetting.list()
      .then((settings) => {
        const row = settings.find((s) => s.key === "theme");
        if (row?.value) {
          try {
            const parsed = JSON.parse(row.value);
            setTheme(parsed);
            applyTokens(parsed);
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  }, []);

  const applyTheme = useCallback((t) => {
    setTheme(t);
    applyTokens(t);
  }, []);

  return <ThemeContext.Provider value={{ theme, applyTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx || { theme: null, applyTheme: () => {} };
}