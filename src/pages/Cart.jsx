import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Minus, Plus, ShoppingBag, ChevronDown, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { base44 } from "@/api/base44Client";
import AddressCheckoutForm from "@/components/checkout/AddressCheckoutForm";

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [products, setProducts] = useState({});

  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  const itemsKey = items.map((i) => i.product_id).join(",");
  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.product_id))];
    if (!ids.length) return;
    Promise.all(ids.map((id) => base44.entities.Product.get(id).catch(() => null))).then((ps) => {
      const map = {};
      ps.forEach((p) => {
        if (p) map[p.id] = p;
      });
      setProducts(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderId = params.get("order");
    if (status === "success" && orderId) {
      base44.entities.Order.get(orderId).then((order) => {
        setPlaced(order);
        clear();
      });
    } else if (status === "cancel") {
      window.history.replaceState({}, "", "/cart");
    }
  }, []);

  const checkout = async (form) => {
    if (window.self !== window.top) {
      alert("Checkout works only from a published app. Please open the app in a new tab to complete your purchase.");
      return;
    }
    setPlacing(true);
    try {
      const customer_name = `${form.first_name} ${form.last_name}`.trim();
      const shipping_address = [form.street, form.apt, form.city, form.state, form.country].filter(Boolean).join(", ");
      const orderNumber = `WM-${Date.now().toString().slice(-6)}`;
      const order = await base44.entities.Order.create({
        customer_name,
        customer_phone: form.phone,
        shipping_address,
        order_number: orderNumber,
        items: items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        subtotal,
        shipping,
        total,
        status: "pending",
      });
      const origin = window.location.origin;
      const res = await base44.functions.invoke("createCheckoutSession", {
        order_id: order.id,
        items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
        shipping,
        success_url: `${origin}/cart?status=success&order=${order.id}`,
        cancel_url: `${origin}/cart?status=cancel`,
      });
      const url = res.data?.url;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      setPlacing(false);
      alert(err.message || "Checkout failed");
    }
  };

  if (placed) {
    return (
      <div className="container-bleed px-5 lg:px-10 py-24 lg:py-32 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="display-text text-4xl mb-4">Order Confirmed</h1>
          <p className="serif-text text-muted-foreground mb-2">Order number</p>
          <p className="text-xl font-bold mb-8">{placed.order_number}</p>
          <p className="serif-text text-muted-foreground mb-10">Thank you, {placed.customer_name}. Your objects are being prepared.</p>
          <Link to="/shop" className="btn-mono-solid">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-bleed px-5 lg:px-10 py-24 lg:py-32 text-center">
        <h1 className="display-text text-5xl mb-4">Your Cart</h1>
        <p className="serif-text text-xl text-muted-foreground mb-10">The cart is empty. Begin your collection.</p>
        <Link to="/shop" className="btn-mono-solid">
          Browse the Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="container-bleed px-5 lg:px-10 py-12 lg:py-20">
      <h1 className="display-text text-5xl lg:text-6xl mb-12">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Items */}
        <div className="lg:col-span-2 space-y-5">
          {items.map((item) => {
            const p = products[item.product_id];
            const originalPrice = p?.price;
            const onSale = p?.sale_price && p?.sale_price < p?.price;
            const lowStock = p && p.stock > 0 && p.stock <= 3;
            return (
              <div key={item.key} className="flex gap-3 pb-5 border-b hairline">
                <Link to={`/product/${item.product_id}`} className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-secondary">
                  {item.image && <Image src={item.image} alt={item.name} className="w-full h-full" fittingType="fill" />}
                  {lowStock && <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] font-medium text-center py-0.5">Only {p.stock} left</span>}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {onSale && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">Sale</span>}
                      <Link to={`/product/${item.product_id}`} className="text-sm font-medium truncate hover:text-accent">
                        {item.name}
                      </Link>
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.variant && (
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <span>{item.variant}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-bold text-red-600">${item.price.toFixed(2)}</span>
                    {onSale && originalPrice > item.price && <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center border border-[#e0e0e0] rounded-full">
                      <button onClick={() => updateQty(item.key, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:text-accent" aria-label="Decrease">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:text-accent" aria-label="Increase">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary + checkout */}
        <div className="lg:col-span-1">
          <div className="border hairline p-6 lg:p-8 sticky top-24">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm border-b hairline pb-5 mb-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <AddressCheckoutForm onSubmit={checkout} placing={placing} />
          </div>
        </div>
      </div>
    </div>
  );
}