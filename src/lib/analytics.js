import { base44 } from "@/api/base44Client";

// Google Analytics 4 event + Base44 built-in analytics.
// GA only loads when a real Measurement ID is set in index.html (window.GA_MEASUREMENT_ID).

export function trackProductView(product) {
  if (!product) return;
  const price = product.sale_price || product.price;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "view_item", {
      currency: "USD",
      value: price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand || undefined,
        item_category: product.category || undefined,
        price,
      }],
    });
  }
  base44.analytics.track({
    eventName: "product_view",
    properties: {
      product_id: product.id,
      name: product.name,
      category: product.category || null,
      brand: product.brand || null,
    },
  });
}

export function trackPageView(path) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "page_view", { page_path: path });
  }
  base44.analytics.track({
    eventName: "page_view",
    properties: {
      path,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    },
  });
}

export function trackAddToCart(product, quantity = 1) {
  if (!product) return;
  const price = product.sale_price || product.price;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "add_to_cart", {
      currency: "USD",
      value: price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand || undefined,
        item_category: product.category || undefined,
        price,
        quantity,
      }],
    });
  }
  base44.analytics.track({
    eventName: "add_to_cart",
    properties: { product_id: product.id, name: product.name, quantity },
  });
}

export function trackOrderPlaced(order) {
  if (!order) return;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: order.order_number || order.id,
      value: order.total,
      currency: "USD",
      items: (order.items || []).map((i) => ({
        item_id: i.product_id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }
  base44.analytics.track({
    eventName: "order_placed",
    properties: { order_id: order.id, total: order.total },
  });
}