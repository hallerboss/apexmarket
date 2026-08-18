import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { base44 } from "@/api/base44Client";

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", shipping_address: "", payment_method: "Card" });

  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

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

  const checkout = async (e) => {
    e.preventDefault();
    if (window.self !== window.top) {
      alert("Checkout works only from a published app. Please open the app in a new tab to complete your purchase.");
      return;
    }
    setPlacing(true);
    try {
      const orderNumber = `WM-${Date.now().toString().slice(-6)}`;
      const order = await base44.entities.Order.create({
        ...form,
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
        customer_email: form.customer_email,
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
          <Link to="/shop" className="btn-mono-solid">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-bleed px-5 lg:px-10 py-24 lg:py-32 text-center">
        <h1 className="display-text text-5xl mb-4">Your Cart</h1>
        <p className="serif-text text-xl text-muted-foreground mb-10">The cart is empty. Begin your collection.</p>
        <Link to="/shop" className="btn-mono-solid">Browse the Archive</Link>
      </div>
    );
  }

  return (
    <div className="container-bleed px-5 lg:px-10 py-12 lg:py-20">
      <h1 className="display-text text-5xl lg:text-6xl mb-12">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.key} className="flex gap-5 border-b hairline pb-6">
              <Link to={`/product/${item.product_id}`} className="w-24 h-32 shrink-0 bg-secondary overflow-hidden">
                {item.image && <Image src={item.image} alt={item.name} className="w-full h-full object-cover" fittingType="fill" />}
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between gap-4">
                    <Link to={`/product/${item.product_id}`} className="text-base font-medium hover:text-accent">{item.name}</Link>
                    <button onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                  </div>
                  {item.variant && <p className="text-sm text-muted-foreground mt-1">{item.variant}</p>}
                  <p className="text-sm font-semibold mt-2">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border hairline">
                    <button onClick={() => updateQty(item.key, item.quantity - 1)} className="p-2 hover:text-accent"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)} className="p-2 hover:text-accent"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + checkout */}
        <div className="lg:col-span-1">
          <div className="border hairline p-6 lg:p-8 sticky top-24">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm border-b hairline pb-5 mb-5">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6"><span>Total</span><span>${total.toFixed(2)}</span></div>

            <form onSubmit={checkout} className="space-y-3">
              <input required placeholder="Full name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none" />
              <input required type="email" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none" />
              <input placeholder="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none" />
              <textarea required placeholder="Shipping address" rows={2} value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none resize-none" />
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full border hairline px-4 py-2.5 text-sm bg-transparent focus:border-accent outline-none">
                <option>Card</option><option>PayPal</option><option>Cash on Delivery</option>
              </select>
              <button type="submit" disabled={placing} className="btn-mono-solid w-full disabled:opacity-50">
                {placing ? "Placing…" : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}