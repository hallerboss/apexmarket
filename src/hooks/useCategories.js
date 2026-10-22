import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Loads categories and keeps them in sync, so a category added in the admin
// panel shows up everywhere (store menus, product form) without a manual reload.
export function useCategories(limit = 200) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return base44.entities.Category.list("order", limit)
      .then((data) => setCategories(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    load();
    return base44.entities.Category.subscribe(() => load());
  }, [load]);

  return { categories, loading, reload: load };
}