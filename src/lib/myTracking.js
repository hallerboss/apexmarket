const KEY = "apex_my_tracking";

export function getMyTracking() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveMyTracking(entry) {
  try {
    const list = getMyTracking();
    const next = [entry, ...list.filter((e) => e.order_number !== entry.order_number)].slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}