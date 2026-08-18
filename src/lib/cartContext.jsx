import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("wolmart_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("wolmart_cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1, variant = null) => {
    setItems((prev) => {
      const key = variant ? `${product.id}_${variant}` : product.id;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          name: product.name,
          price: product.sale_price || product.price,
          image: product.images?.[0],
          quantity: qty,
          variant,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQty = useCallback((key, qty) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, qty) } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}