import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import ProductRow from "@/components/store/ProductRow";
import SectionHeader from "@/components/store/SectionHeader";
import HeroCarousel from "@/components/store/HeroCarousel";

const FASHION_BANNER = "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/c1a582fac_generated_6bd4c4e4.png";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list("-created_date", 50),
      base44.entities.Banner.filter({ active: true }),
    ])
      .then(([data, b]) => { setProducts(data); setBanners(b); })
      .finally(() => setLoading(false));
    // Fire-and-forget: process abandoned cart recovery emails
    base44.functions.invoke("processCartRecovery").catch(() => {});
  }, []);

  const promoBanner = banners.find((b) => b.position === "promo" && b.active);
  const featured = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.is_new);
  const bestSellers = products.filter((p) => p.best_seller);
  const topRated = products.filter((p) => p.top_rated);
  const seasonalPicks = products.filter(
    (p) => (p.tags || []).some((t) => /seasonal|summer|winter|fall|spring|holiday/i.test(t)) || (p.sale_price && p.sale_price < p.price)
  );

  return (
    <div>
      <HeroCarousel />

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
                <Image src={promoBanner?.image || FASHION_BANNER} alt={promoBanner?.title || "New collection"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/80 mb-3">{promoBanner?.subtitle || "Best Sellers"}</p>
                  <h3 className="display-text text-3xl lg:text-5xl text-white">{promoBanner?.title || "New Collection"}</h3>
                  <p className="serif-text text-white/80 mt-3">{promoBanner?.description || "Sale up to 30% OFF"}</p>
                  <Link to={promoBanner?.link || "/shop"} className="btn-mono-solid mt-6 self-start">{promoBanner?.cta_text || "Shop Now"}</Link>
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

          {/* SEASONAL PICKS */}
          {seasonalPicks.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Limited Time" title="Seasonal Picks" link="/shop?deals=1" />
              <ProductRow products={seasonalPicks.slice(0, 4)} />
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