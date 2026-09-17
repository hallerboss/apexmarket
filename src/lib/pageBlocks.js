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

export const WIDGET_GROUPS = [
  { id: "basic", label: "Basic" },
  { id: "store", label: "Store" },
  { id: "media", label: "Media" },
  { id: "layout", label: "Layout" },
];

export const WIDGET_LIBRARY = [
  { type: "heading", label: "Heading", icon: "Heading1", group: "basic" },
  { type: "text", label: "Text Editor", icon: "Type", group: "basic" },
  { type: "button", label: "Button", icon: "MousePointerClick", group: "basic" },
  { type: "list", label: "List", icon: "List", group: "basic" },
  { type: "iconBox", label: "Icon Box", icon: "Star", group: "basic" },
  { type: "counter", label: "Animated Counter", icon: "Hash", group: "basic" },
  { type: "countdown", label: "Countdown Timer", icon: "Timer", group: "basic" },
  { type: "divider", label: "Divider", icon: "Minus", group: "basic" },
  { type: "spacer", label: "Spacer", icon: "MoveVertical", group: "basic" },

  { type: "products", label: "Product Grid", icon: "LayoutGrid", group: "store" },
  { type: "pricing", label: "Pricing Tables", icon: "Table", group: "store" },
  { type: "menuPrice", label: "Menu Price", icon: "Receipt", group: "store" },
  { type: "megamenu", label: "Mega Menu", icon: "Menu", group: "store" },
  { type: "sidebar", label: "Sidebar", icon: "PanelLeft", group: "store" },
  { type: "testimonials", label: "Testimonials", icon: "Quote", group: "store" },
  { type: "team", label: "Team Member", icon: "Users", group: "store" },
  { type: "contactForm", label: "Contact Form", icon: "Mail", group: "store" },
  { type: "newsletter", label: "Newsletter", icon: "Send", group: "store" },

  { type: "hero", label: "Hero Banner", icon: "Presentation", group: "media" },
  { type: "image", label: "Image", icon: "Image", group: "media" },
  { type: "gallery", label: "Images Gallery", icon: "Images", group: "media" },
  { type: "video", label: "Video", icon: "PlayCircle", group: "media" },
  { type: "map", label: "Google Map", icon: "MapPin", group: "media" },
  { type: "hotspot", label: "Image Hotspot", icon: "Crosshair", group: "media" },
  { type: "social", label: "Social Buttons", icon: "Share2", group: "media" },

  { type: "cta", label: "Call To Action", icon: "Megaphone", group: "layout" },
  { type: "timeline", label: "Timeline", icon: "GitCommitHorizontal", group: "layout" },
  { type: "tabs", label: "Tabs", icon: "Columns", group: "layout" },
  { type: "navAnchor", label: "Navigation Anchor", icon: "Anchor", group: "layout" },
  { type: "popup", label: "Popup", icon: "Square", group: "layout" },
];

export const WIDGET_ICON_NAMES = WIDGET_LIBRARY.map((w) => w.icon);

export const BLOCK_DEFAULTS = {
  heading: { text: "Your headline here", fontFamily: "heading", fontSize: "lg", align: "left", pad: "sm" },
  text: { text: "Write your paragraph here. Open the settings to change typography and colors.", fontFamily: "serif", fontSize: "md", align: "left", pad: "sm" },
  button: { label: "Learn more", href: "/shop", bgColor: "#111111", textColor: "#ffffff", align: "left", pad: "sm" },
  image: { url: "", alt: "", height: "md", align: "center", pad: "sm" },
  hero: { title: "Big bold statement", subtitle: "A supporting line of copy.", image: "", ctaText: "Shop now", ctaHref: "/shop", align: "left", height: "lg", pad: "none" },
  products: { title: "Featured picks", category: "", limit: 4, columns: 4, align: "left", pad: "md" },
  divider: { color: "", pad: "none" },
  spacer: { height: "md", pad: "none" },

  list: {
    title: "",
    items: ["Free worldwide shipping", "30-day easy returns", "Dedicated support team"],
    fontFamily: "body",
    fontSize: "md",
    textColor: "",
    align: "left",
    pad: "md",
  },
  iconBox: {
    icon: "star",
    title: "Crafted to last",
    text: "A short supporting line explaining this benefit.",
    align: "center",
    pad: "md",
  },
  counter: {
    items: [
      { value: "250+", label: "Curated products" },
      { value: "40", label: "Countries shipped" },
      { value: "99%", label: "Happy customers" },
    ],
    textColor: "",
    bgColor: "",
    align: "center",
    pad: "lg",
  },
  countdown: {
    title: "Offer ends soon",
    date: "",
    bgColor: "",
    textColor: "",
    align: "center",
    pad: "lg",
  },

  pricing: {
    title: "Simple pricing",
    plans: [
      { name: "Starter", price: "$19", period: "/month", features: "1 store, Basic analytics", ctaText: "Choose plan", ctaHref: "#" },
      { name: "Growth", price: "$49", period: "/month", features: "5 stores, Advanced analytics", ctaText: "Choose plan", ctaHref: "#" },
      { name: "Scale", price: "$99", period: "/month", features: "Unlimited stores, Priority support", ctaText: "Choose plan", ctaHref: "#" },
    ],
    align: "center",
    pad: "lg",
  },
  menuPrice: {
    title: "Our menu",
    items: [
      { name: "Signature Espresso", price: "$4.50", description: "Double shot, house blend" },
      { name: "Flat White", price: "$5.20", description: "Silky steamed milk" },
      { name: "Cold Brew", price: "$5.80", description: "18-hour slow steep" },
    ],
    align: "left",
    pad: "lg",
  },
  megamenu: {
    title: "Shop by category",
    columns: 3,
    links: [
      { label: "New Arrivals" }, { label: "Best Sellers" }, { label: "Sale" },
      { label: "Electronics" }, { label: "Fashion" }, { label: "Furniture" },
      { label: "Gift Cards" }, { label: "Support" }, { label: "Track Order" },
    ],
    align: "left",
    pad: "md",
  },
  sidebar: {
    title: "Categories",
    items: ["Electronics", "Fashion", "Furniture", "Home & Living"],
    align: "left",
    pad: "md",
  },
  testimonials: {
    title: "Loved by our customers",
    items: [
      { quote: "The quality is far beyond what I expected for the price.", author: "Amelia R.", role: "Verified buyer" },
      { quote: "Fast delivery and beautiful packaging. Will order again.", author: "Daniel K.", role: "Verified buyer" },
      { quote: "Customer service solved my issue in minutes.", author: "Priya S.", role: "Verified buyer" },
    ],
    align: "center",
    pad: "lg",
  },
  team: {
    title: "Meet the team",
    columns: 3,
    members: [
      { name: "Alex Morgan", role: "Founder", image: "" },
      { name: "Sara Lin", role: "Head of Design", image: "" },
      { name: "Omar Farooq", role: "Operations", image: "" },
    ],
    align: "center",
    pad: "lg",
  },
  contactForm: {
    title: "Get in touch",
    subtitle: "We usually reply within one business day.",
    align: "center",
    pad: "lg",
  },
  newsletter: {
    title: "Join our newsletter",
    subtitle: "New arrivals and members-only offers, once a week.",
    placeholder: "Your email address",
    buttonLabel: "Subscribe",
    bgColor: "#111111",
    textColor: "#ffffff",
    align: "center",
    pad: "xl",
  },

  gallery: { title: "", images: [], columns: 3, height: "md", align: "center", pad: "md" },
  video: { url: "", title: "", align: "center", pad: "md" },
  map: { address: "London, United Kingdom", height: "md", align: "center", pad: "md" },
  hotspot: {
    image: "",
    title: "Shop the look",
    points: [
      { x: 32, y: 38, label: "Wool coat", href: "#" },
      { x: 64, y: 66, label: "Leather bag", href: "#" },
    ],
    align: "center",
    pad: "md",
  },
  social: {
    title: "Follow us",
    links: [
      { network: "instagram" }, { network: "facebook" }, { network: "x" }, { network: "youtube" },
    ],
    align: "center",
    pad: "md",
  },

  cta: {
    title: "Ready to get started?",
    subtitle: "Join thousands of shoppers already browsing the collection.",
    ctaText: "Browse the shop",
    ctaHref: "/shop",
    bgColor: "#111111",
    textColor: "#ffffff",
    align: "center",
    pad: "xl",
  },
  timeline: {
    title: "Our journey",
    items: [
      { date: "2018", title: "Where it began", text: "A small studio with a big idea." },
      { date: "2021", title: "Going global", text: "Shipping to over 40 countries." },
      { date: "2025", title: "Today", text: "A curated marketplace of makers." },
    ],
    align: "left",
    pad: "lg",
  },
  tabs: {
    items: [
      { title: "Description", text: "Tell shoppers what makes this collection special." },
      { title: "Shipping", text: "Orders ship within 24 hours, worldwide." },
      { title: "Returns", text: "30-day easy returns on every item." },
    ],
    align: "left",
    pad: "lg",
  },
  navAnchor: { anchor: "section-1", pad: "none" },
  popup: {
    buttonLabel: "Open offer",
    title: "Get 10% off your first order",
    text: "Sign up today and we'll email you a discount code.",
    align: "center",
    pad: "md",
  },
};

export function createBlock(type) {
  const defaults = BLOCK_DEFAULTS[type] || {};
  return {
    id: `b_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    type,
    ...JSON.parse(JSON.stringify(defaults)),
  };
}

export function widgetLabel(type) {
  return WIDGET_LIBRARY.find((w) => w.type === type)?.label || type;
}