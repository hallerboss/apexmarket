export const FONT_OPTIONS = [
  { label: "Display", value: "heading" },
  { label: "Body", value: "body" },
  { label: "Serif", value: "serif" },
];

export const ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

export const PAD_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra large", value: "xl" },
];

export const SIZE_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
];

export const BLOCK_LIBRARY = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "button", label: "Button" },
  { type: "image", label: "Image" },
  { type: "hero", label: "Hero Banner" },
  { type: "products", label: "Product Grid" },
  { type: "divider", label: "Divider" },
  { type: "spacer", label: "Spacer" },
];

export const BLOCK_DEFAULTS = {
  heading: { text: "Your headline here", fontFamily: "heading", fontSize: "lg", align: "left", pad: "sm" },
  text: { text: "Write your paragraph here. Open the settings to change typography and colors.", fontFamily: "serif", fontSize: "md", align: "left", pad: "sm" },
  button: { label: "Learn more", href: "/shop", bgColor: "#111111", textColor: "#ffffff", align: "left", pad: "sm" },
  image: { url: "", alt: "", height: "md", pad: "sm" },
  hero: { title: "Big bold statement", subtitle: "A supporting line of copy.", image: "", ctaText: "Shop now", ctaHref: "/shop", align: "left", height: "lg", pad: "none" },
  products: { title: "Featured picks", category: "", limit: 4, columns: 4, pad: "md" },
  divider: { color: "", pad: "none" },
  spacer: { height: "md", pad: "none" },
};

export function createBlock(type) {
  return { id: `b_${Math.random().toString(36).slice(2, 10)}`, type, ...BLOCK_DEFAULTS[type] };
}