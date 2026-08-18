import { createContext, useContext, useState, useEffect } from "react";

const CompareContext = createContext(null);
const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compareIds") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("compareIds", JSON.stringify(ids));
  }, [ids]);

  const has = (id) => ids.includes(id);
  const toggle = (id) =>
    setIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < MAX_COMPARE ? [...cur, id] : cur
    );
  const remove = (id) => setIds((cur) => cur.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <CompareContext.Provider value={{ ids, has, toggle, remove, clear, count: ids.length, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}