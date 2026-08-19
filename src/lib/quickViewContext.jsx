import { createContext, useContext, useState } from "react";
import QuickViewModal from "@/components/store/QuickViewModal";

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);
  const open = (p) => setProduct(p);
  const close = () => setProduct(null);
  return (
    <QuickViewContext.Provider value={{ open, close }}>
      {children}
      {product && <QuickViewModal product={product} onClose={close} />}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within a QuickViewProvider");
  return ctx;
}