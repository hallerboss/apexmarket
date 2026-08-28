import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MEGA = [
  {
    name: "Fashion",
    columns: [
      { title: "Women", items: ["New Arrivals", "Best Sellers", "Trending", "Clothing", "Shoes", "Bags", "Accessories", "Jewelry & Watches"] },
      { title: "Men", items: ["New Arrivals", "Best Sellers", "Trending", "Clothing", "Shoes", "Bags", "Accessories", "Jewelry & Watches"] },
    ],
    promo: { badge: "Get up to 20% OFF", title: "Hot Sales", cta: "Shop Now", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80", gradient: "from-rose-500 to-orange-400" },
  },
  {
    name: "Home & Garden",
    columns: [
      { title: "Bedroom", items: ["Beds, Frames & Bases", "Dressers", "Nightstands", "Kid's Beds & Headboards", "Armoires"] },
      { title: "Living Room", items: ["Coffee Tables", "Chairs", "Tables", "Futons & Sofa Beds", "Cabinets & Chests"] },
      { title: "Office", items: ["Office Chairs", "Desks", "Bookcases", "File Cabinets", "Breakroom Tables"] },
      { title: "Kitchen & Dining", items: ["Dining Sets", "Kitchen Storage Cabinets", "Bakers Racks", "Dining Chairs", "Dining Room Tables"] },
    ],
    promo: { badge: "Up to 25% OFF", title: "Furniture Sale", cta: "Shop Now", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80", gradient: "from-emerald-500 to-teal-500" },
  },
  {
    name: "Electronics",
    columns: [
      { title: "Phones & Tablets", items: ["Smartphones", "Tablets", "Cases & Covers", "Screen Protectors", "Chargers"] },
      { title: "Computers", items: ["Laptops", "Desktops", "Monitors", "Keyboards & Mice", "Storage"] },
      { title: "TV & Audio", items: ["Televisions", "Headphones", "Speakers", "Sound Bars", "Home Theater"] },
      { title: "Cameras", items: ["DSLRs", "Mirrorless", "Lenses", "Drones", "Accessories"] },
    ],
    promo: { badge: "New Tech Arrivals", title: "Save 15%", cta: "Shop Now", image: "https://images.unsplash.com/photo-1498049794561-7780e7231663?auto=format&fit=crop&w=400&q=80", gradient: "from-sky-500 to-indigo-500" },
  },
  {
    name: "Furniture",
    columns: [
      { title: "Furniture", items: ["Sofas & Couches", "Armchairs", "Bed Frames", "Bedside Tables", "Dressing Tables"] },
      { title: "Lighting", items: ["Light Bulbs", "Lamps", "Ceiling Lights", "Wall Lights", "Bathroom Lighting"] },
      { title: "Home Accessories", items: ["Decorative Accessories", "Candles & Holders", "Home Fragrance", "Mirrors", "Clocks"] },
      { title: "Garden & Outdoors", items: ["Garden Furniture", "Lawn Mowers", "Pressure Washers", "All Garden Tools", "Outdoor Dining"] },
    ],
    promo: { badge: "Starting at $125", title: "New Arrivals", cta: "Shop Now", image: "https://images.unsplash.com/photo-1555041469-a586c31ea4bc?auto=format&fit=crop&w=400&q=80", gradient: "from-amber-500 to-orange-500" },
  },
  {
    name: "Health & Beauty",
    columns: [
      { title: "Skincare", items: ["Cleansers", "Moisturizers", "Serums", "Masks", "Sun Care"] },
      { title: "Makeup", items: ["Foundation", "Lipstick", "Eye Makeup", "Brushes", "Sets"] },
      { title: "Hair Care", items: ["Shampoo", "Conditioner", "Styling", "Treatments", "Tools"] },
      { title: "Fragrance", items: ["Women", "Men", "Unisex", "Gift Sets", "Rollerballs"] },
    ],
    promo: { badge: "Glow Up Sale", title: "Up to 30% OFF", cta: "Shop Now", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80", gradient: "from-pink-500 to-fuchsia-500" },
  },
  {
    name: "Toys & Games",
    columns: [
      { title: "Action Figures", items: ["Superheroes", "Anime", "Collectibles", "Building Sets", "Playsets"] },
      { title: "Board Games", items: ["Family", "Strategy", "Party", "Card Games", "Puzzles"] },
      { title: "Outdoor Toys", items: ["Ride-Ons", "Bubbles", "Sports", "Water Fun", "Kites"] },
      { title: "Educational", items: ["STEM", "Arts & Crafts", "Books", "Music", "Learning Toys"] },
    ],
    promo: { badge: "Kids Love It", title: "Toy Deals", cta: "Shop Now", image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&q=80", gradient: "from-yellow-500 to-amber-500" },
  },
  {
    name: "Cooking",
    columns: [
      { title: "Cookware", items: ["Pots & Pans", "Skillets", "Dutch Ovens", "Woks", "Stockpots"] },
      { title: "Baking", items: ["Bakeware", "Mixing Bowls", "Measuring", "Baking Sheets", "Molds"] },
      { title: "Kitchen Tools", items: ["Knives", "Cutting Boards", "Utensils", "Gadgets", "Storage"] },
      { title: "Appliances", items: ["Mixers", "Blenders", "Coffee Makers", "Air Fryers", "Cookers"] },
    ],
    promo: { badge: "Cook More", title: "From $19", cta: "Shop Now", image: "https://images.unsplash.com/photo-1556909212-d5b604d0c31d?auto=format&fit=crop&w=400&q=80", gradient: "from-lime-500 to-emerald-500" },
  },
  {
    name: "Smart Phones",
    columns: [
      { title: "Smartphones", items: ["New Releases", "Flagships", "Budget", "Refurbished", "Unlocked"] },
      { title: "Cases & Covers", items: ["Clear", "Leather", "Rugged", "Designer", "Wallet"] },
      { title: "Chargers", items: ["Wall", "Wireless", "Power Banks", "Car", "Cables"] },
      { title: "Screen Protectors", items: ["Tempered Glass", "Privacy", "Film", "Full Cover", "Packs"] },
    ],
    promo: { badge: "Latest Models", title: "Up to $200 OFF", cta: "Shop Now", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80", gradient: "from-violet-500 to-purple-500" },
  },
  {
    name: "Accessories",
    columns: [
      { title: "Bags", items: ["Handbags", "Backpacks", "Totes", "Crossbody", "Clutches"] },
      { title: "Wallets", items: ["Bifold", "Trifold", "Cardholders", "Zip", "RFID"] },
      { title: "Belts", items: ["Leather", "Reversible", "Casual", "Formal", "Chain"] },
      { title: "Sunglasses", items: ["Aviator", "Wayfarer", "Round", "Sport", "Polarized"] },
    ],
    promo: { badge: "Finish Your Look", title: "Buy 2 Get 1", cta: "Shop Now", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80", gradient: "from-stone-600 to-amber-700" },
  },
  {
    name: "Sports & Outdoors",
    columns: [
      { title: "Fitness", items: ["Yoga", "Weights", "Cardio", "Apparel", "Accessories"] },
      { title: "Camping", items: ["Tents", "Sleeping Bags", "Backpacks", "Cooking", "Lighting"] },
      { title: "Cycling", items: ["Bikes", "Helmets", "Lights", "Locks", "Parts"] },
      { title: "Team Sports", items: ["Soccer", "Basketball", "Baseball", "Football", "Tennis"] },
    ],
    promo: { badge: "Get Active", title: "Up to 40% OFF", cta: "Shop Now", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80", gradient: "from-cyan-500 to-blue-500" },
  },
  {
    name: "Books & Media",
    columns: [
      { title: "Fiction", items: ["Bestsellers", "Classics", "Mystery", "Romance", "Sci-Fi"] },
      { title: "Non-Fiction", items: ["Biography", "Self-Help", "History", "Business", "Cookbooks"] },
      { title: "Children's", items: ["Picture Books", "Chapter", "Activity", "Education", "Boxed Sets"] },
      { title: "Textbooks", items: ["Science", "Math", "Humanities", "Test Prep", "Reference"] },
    ],
    promo: { badge: "Read More", title: "From $4.99", cta: "Shop Now", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80", gradient: "from-indigo-500 to-blue-600" },
  },
  {
    name: "Baby & Kids",
    columns: [
      { title: "Baby Care", items: ["Diapers", "Wipes", "Feeding", "Bath", "Health"] },
      { title: "Toys", items: ["Rattles", "Plush", "Blocks", "Mobiles", "Play Mats"] },
      { title: "Clothing", items: ["Onesies", "Sets", "Sleepwear", "Outerwear", "Shoes"] },
      { title: "Nursery", items: ["Cribs", "Bedding", "Decor", "Storage", "Monitors"] },
    ],
    promo: { badge: "Little Ones", title: "Baby Sale", cta: "Shop Now", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80", gradient: "from-pink-400 to-rose-500" },
  },
  {
    name: "Automotive",
    columns: [
      { title: "Parts & Accessories", items: ["Interior", "Exterior", "Performance", "Replacement", "Tools"] },
      { title: "Tools", items: ["Hand Tools", "Power Tools", "Diagnostic", "Jacks", "Safety"] },
      { title: "Care", items: ["Wash", "Wax", "Polish", "Interior", "Detailing"] },
      { title: "Electronics", items: ["Dash Cams", "Stereo", "GPS", "Lighting", "Chargers"] },
    ],
    promo: { badge: "Road Ready", title: "Up to 35% OFF", cta: "Shop Now", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80", gradient: "from-zinc-600 to-slate-700" },
  },
  {
    name: "Pet Supplies",
    columns: [
      { title: "Dogs", items: ["Food", "Toys", "Beds", "Leashes", "Grooming"] },
      { title: "Cats", items: ["Food", "Litter", "Trees", "Toys", "Grooming"] },
      { title: "Fish", items: ["Food", "Tanks", "Filters", "Decor", "Care"] },
      { title: "Birds", items: ["Food", "Cages", "Toys", "Perches", "Care"] },
    ],
    promo: { badge: "Spoil Your Pet", title: "From $2.99", cta: "Shop Now", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=400&q=80", gradient: "from-orange-400 to-amber-500" },
  },
];

function PromoBlock({ promo, onShop }) {
  return (
    <div className={`mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br ${promo.gradient} p-5 text-white min-h-[160px] flex flex-col justify-between`}>
      {promo.image ? (
        <img
          src={promo.image}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute right-0 top-0 h-full w-2/5 object-cover opacity-90"
        />
      ) : null}
      <div className="relative z-10">
        <p className="text-xs font-semibold text-white/90">{promo.badge}</p>
        <p className="text-2xl font-bold mt-1">{promo.title}</p>
      </div>
      <button onClick={onShop} className="relative z-10 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
        {promo.cta} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AllCategoriesMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [cats, setCats] = useState([]);
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Category.list("order", 100).then(setCats).catch(() => {});
    base44.entities.Banner.filter({ active: true }).then(setBanners).catch(() => {});
  }, []);

  const CURATED = Object.fromEntries(MEGA.map((m) => [m.name, m]));
  const list = cats.length ? cats.map((c) => c.name) : MEGA.map((m) => m.name);
  const activeName = list[active] || list[0] || "";
  const curated = CURATED[activeName];
  const shopUrl = `/shop?category=${encodeURIComponent(activeName)}`;
  const banner = banners.find((b) => b.link === shopUrl);
  const promo = banner
    ? { badge: banner.subtitle, title: banner.title, cta: banner.cta_text || "Shop Now", image: banner.image, gradient: curated?.promo?.gradient || "from-blue-500 to-indigo-500" }
    : curated?.promo || { badge: "Shop the Collection", title: "Up to 20% OFF", cta: "Shop Now", image: "", gradient: "from-blue-500 to-indigo-500" };
  const columns = curated?.columns || [];

  const go = (cat) => {
    setOpen(false);
    navigate(`/shop?category=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-10 px-4 flex items-center gap-2 bg-[#0066ff] text-white text-sm font-semibold rounded-md hover:bg-[#0058d4] transition-colors"
      >
        <List className="w-4 h-4" /> All Categories <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 z-40 flex bg-white border border-[#eee] shadow-xl rounded-md overflow-hidden">
            {/* Sidebar */}
            <div className="w-56 shrink-0 py-2 bg-white max-h-[460px] overflow-y-auto">
              {list.map((name, i) => (
                <button
                  key={name}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(name)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    i === active ? "text-[#0066ff] font-medium bg-[#f5f9ff]" : "text-[#333] hover:text-[#0066ff] hover:bg-[#f5f9ff]"
                  }`}
                >
                  <span>{name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-[#eee]">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/shop");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#333] hover:text-[#0066ff]"
                >
                  View All Categories
                </button>
              </div>
            </div>

            {/* Flyout (desktop) */}
            <div className="hidden lg:block w-[660px] p-6 bg-white border-l border-[#eee]">
              {columns.length > 0 ? (
                <div className={`grid gap-8 ${columns.length > 2 ? "grid-cols-4" : "grid-cols-2"}`}>
                  {columns.map((col) => (
                    <div key={col.title}>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-[#333] pb-2 mb-2 border-b border-[#e1e1e1]">{col.title}</h4>
                      <ul className="space-y-1.5">
                        {col.items.map((it) => (
                          <li key={it}>
                            <button onClick={() => go(activeName)} className="text-sm text-[#555] hover:text-[#0066ff] text-left">
                              {it}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-[#333] pb-2 mb-3 border-b border-[#e1e1e1]">{activeName}</h4>
                  <button onClick={() => go(activeName)} className="text-sm text-[#0066ff] font-semibold">
                    View all in {activeName} →
                  </button>
                </div>
              )}
              <PromoBlock promo={promo} onShop={() => go(activeName)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}