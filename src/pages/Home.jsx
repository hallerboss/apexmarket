import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import ProductRow from "@/components/store/ProductRow";
import SectionHeader from "@/components/store/SectionHeader";

const HERO_IMG = "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/b4d672465_generated_e014edfb.png";
const FASHION_BANNER = "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/c1a582fac_generated_6bd4c4e4.png";

const drops = ["8K Cinema Camera", "Wireless Headphones", "Minimalist Watch", "Oak Dining Chair", "Red Sneakers"];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDrop, setActiveDrop] = useState(0);
  const [heroImg, setHeroImg] = useState(HERO_IMG);

  useEffect(() => {
    base44.entities.Product.list("-created_date", 50)
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.is_new);
  const bestSellers = products.filter((p) => p.best_seller);
  const topRated = products.filter((p) => p.top_rated);

  const heroImages = [
    "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/1b457fe46_generated_fd5ba768.png",
    "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/6acb5954a_generated_411469a4.png",
    "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/148dc9c7d_generated_b5b068d8.png",
    "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/b9e37d828_generated_16f46577.png",
    "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/d88caaa8c_generated_0e311836.png",
  ];

  return (
    <div>
      {/* HERO — split screen */}
      <section className="container-bleed px-5 lg:px-10 min-h-[70vh] lg:min-h-[80vh] flex flex-col lg:flex-row gap-8 lg:gap-16 pt-8 lg:pt-12 pb-12 lg:pb-20">
        <div className="lg:w-1/2 flex flex-col justify-between order-2 lg:order-1">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-6">New Collection · 2024</p>
            <h1 className="display-text text-[10vw] lg:text-[6vw] leading-[0.85]">
              Electronic<br />Sale
            </h1>
            <p className="serif-text text-lg lg:text-xl text-muted-foreground mt-8 max-w-md leading-relaxed">
              Starting at $299.99. A curated archive of objects worth owning — engineered for the modern ritual of commerce.
            </p>
            <div className="flex gap-4 mt-10">
              <Link to="/shop" className="btn-mono-solid">Shop Now</Link>
              <Link to="/shop?deals=1" className="btn-mono-outline">Hot Deals</Link>
            </div>
          </div>
          {/* Drops list */}
          <div className="mt-12 lg:mt-0 border-t hairline pt-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Current Drops</p>
            <div className="flex flex-col">
              {drops.map((d, i) => (
                <button
                  key={d}
                  onMouseEnter={() => { setActiveDrop(i); setHeroImg(heroImages[i]); }}
                  className={`text-left py-2.5 border-b hairline text-sm transition-all duration-300 flex items-center justify-between group ${
                    activeDrop === i ? "text-accent pl-4" : "text-foreground"
                  }`}
                >
                  <span>{d}</span>
                  <span className="text-[10px] text-muted-foreground">0{i + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 order-1 lg:order-2 relative">
          <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden bg-secondary">
            <Image src={heroImg} alt="Featured drop" className="w-full h-full" fittingType="fill" />
            <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur px-5 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Now Featured</p>
              <p className="text-sm font-semibold">{drops[activeDrop]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOT DEALS BAR */}
      <section className="bg-foreground text-background py-6 overflow-hidden">
        <div className="container-bleed px-5 lg:px-10 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">Hot Deal</span>
            <p className="serif-text text-base lg:text-lg">Cina Bluetooth Speaker — The Seller of the Month</p>
          </div>
          <Link to="/shop?deals=1" className="text-[11px] uppercase tracking-[0.2em] font-semibold hover:text-accent whitespace-nowrap hidden sm:block">Buy Now →</Link>
        </div>
      </section>

      {loading ? (
        <div className="container-bleed px-5 lg:px-10 py-32 text-center">
          <div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* POPULAR DEPARTMENTS */}
          <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
            <SectionHeader eyebrow="Curated" title="Popular Departments" link="/shop" />
            <ProductRow products={products.slice(0, 4)} />
          </section>

          {/* PROMO BANNER — asymmetric */}
          <section className="container-bleed px-5 lg:px-10 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              <div className="relative aspect-[16/10] lg:aspect-[16/9] overflow-hidden bg-secondary group">
                <Image src={FASHION_BANNER} alt="New collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/80 mb-3">Best Sellers</p>
                  <h3 className="display-text text-3xl lg:text-5xl text-white">New Collection</h3>
                  <p className="serif-text text-white/80 mt-3">Sale up to 30% OFF</p>
                  <Link to="/shop" className="btn-mono-solid mt-6 self-start">Shop Now</Link>
                </div>
              </div>
              <div className="relative aspect-[16/10] lg:aspect-[16/9] overflow-hidden bg-foreground group">
                <div className="absolute inset-0 flex flex-col justify-center p-8 lg:p-12">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-4">The Seller of Month</p>
                  <h3 className="display-text text-3xl lg:text-5xl text-background">Cina Bluetooth Speaker</h3>
                  <p className="serif-text text-background/60 mt-3 max-w-xs">Sound as sculpture. Engineered for presence.</p>
                  <Link to="/shop" className="btn-mono-outline mt-6 self-start border-background text-background hover:bg-background hover:text-foreground">Shop Now</Link>
                </div>
              </div>
            </div>
          </section>

          {/* NEW ARRIVALS */}
          {newArrivals.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Fresh" title="New Arrivals" link="/shop" />
              <ProductRow products={newArrivals.slice(0, 4)} />
            </section>
          )}

          {/* TOP RANKING */}
          {topRated.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Acclaimed" title="Top Ranking" link="/shop" />
              <ProductRow products={topRated.slice(0, 4)} />
            </section>
          )}

          {/* BEST SELLERS */}
          {bestSellers.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Most Wanted" title="Best Sellers" link="/shop" />
              <ProductRow products={bestSellers.slice(0, 4)} />
            </section>
          )}

          {/* FEATURED */}
          {featured.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Selected" title="Our Featured" link="/shop" />
              <ProductRow products={featured.slice(0, 4)} />
            </section>
          )}

          {/* JUST FOR YOU — full grid */}
          <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24 border-t hairline">
            <SectionHeader eyebrow="Personal" title="Just For You" />
            <ProductRow products={products.slice(0, 8)} />
            <div className="text-center mt-12">
              <Link to="/shop" className="btn-mono-outline">Load More</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}