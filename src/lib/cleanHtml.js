// Rich-text fields saved from imports/editors can contain non-breaking spaces
// (&nbsp;). They remove every word-break opportunity, so on narrow screens the
// text can't wrap and the layout collapses. Normalize them before rendering.
export function cleanHtml(html) {
  return (html || "").replace(/&nbsp;|\u00a0/g, " ");
}