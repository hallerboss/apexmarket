export function buildCategoryTree(cats = []) {
  const nodes = new Map();
  (cats || []).forEach((c) => {
    if (c?.name) nodes.set(c.name, { ...c, children: [] });
  });
  const roots = [];
  nodes.forEach((node) => {
    const parent = node.parent ? nodes.get(node.parent) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const sortNodes = (list) => {
    list.sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(String(b.name)));
    list.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  const labelNodes = (list, prefix) => {
    list.forEach((n) => {
      const path = [...prefix, n.name];
      n.path = path;
      n.label = path.join(" › ");
      labelNodes(n.children, path);
    });
  };
  labelNodes(roots, []);

  return roots;
}

export function categoryDescendants(node) {
  const acc = [];
  const walk = (n) => {
    n.children.forEach((child) => {
      acc.push(child);
      walk(child);
    });
  };
  walk(node);
  return acc;
}

export function categoryAncestors(cats = [], name) {
  if (!name) return [];
  const byName = new Map((cats || []).map((c) => [c.name, c]));
  const chain = [];
  const seen = new Set();
  let current = byName.get(name);
  while (current && !seen.has(current.name)) {
    seen.add(current.name);
    chain.unshift(current.name);
    current = current.parent ? byName.get(current.parent) : null;
  }
  return chain;
}

export function categoryWithDescendants(cats = [], name) {
  if (!name) return [];
  const names = [name];
  let added = true;
  while (added) {
    added = false;
    (cats || []).forEach((c) => {
      if (c.parent && names.includes(c.parent) && !names.includes(c.name)) {
        names.push(c.name);
        added = true;
      }
    });
  }
  return names;
}