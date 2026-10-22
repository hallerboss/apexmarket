import { createContext, useContext, useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const WishlistContext = createContext(null);
const STORAGE_KEY = "wishlistIds";

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(readLocal);
  const loadedFor = useRef(undefined);

  // When a customer signs in, load the wishlist saved on their account
  // (a guest list is moved into the account on first sign-in).
  useEffect(() => {
    const userId = user?.id || null;
    if (loadedFor.current === userId) return;
    loadedFor.current = userId;
    if (!userId) return;
    const saved = Array.isArray(user.wishlist) ? user.wishlist : [];
    const guest = readLocal();
    const next = saved.length ? saved : guest;
    setIds(next);
    if (!saved.length && guest.length) {
      base44.auth.updateMe({ wishlist: guest }).catch(() => {});
    }
  }, [user]);

  // Mirror every change to local storage and to the signed-in customer's account.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    if (user?.id) {
      base44.auth.updateMe({ wishlist: ids }).catch(() => {});
    }
  }, [ids, user?.id]);

  const has = (id) => ids.includes(id);
  const toggle = (id) =>
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const remove = (id) => setIds((cur) => cur.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, remove, clear, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}