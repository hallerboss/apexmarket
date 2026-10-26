import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LOGIN_URL = "https://www.usawishlist.com/login";

export default function AuthButtons({ variant = "header" }) {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    base44.auth
      .isAuthenticated()
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;

  if (variant === "drawer") {
    const rowClass =
      "flex items-center gap-3 px-5 py-4 text-base text-white border-b border-white/10 hover:bg-white/5 w-full text-left";
    return authed ? (
      <button type="button" onClick={() => base44.auth.logout()} className={rowClass}>
        <LogOut className="w-4 h-4 text-[#3b82f6]" /> Sign Out
      </button>
    ) : (
      <a href={LOGIN_URL} className={rowClass}>
        <LogIn className="w-4 h-4 text-[#3b82f6]" /> Sign In
      </a>
    );
  }

  const headerClass =
    "flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] font-semibold hover:text-accent transition-colors";

  return authed ? (
    <button type="button" onClick={() => base44.auth.logout()} className={headerClass} aria-label="Sign out">
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  ) : (
    <a href={LOGIN_URL} className={headerClass} aria-label="Sign in">
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Sign In</span>
    </a>
  );
}