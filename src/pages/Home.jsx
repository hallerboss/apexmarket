import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ProductRow from "@/components/store/ProductRow";
import SectionHeader from "@/components/store/SectionHeader";
import HeroCarousel from "@/components/store/HeroCarousel";

const OFFICE_SUPPLIES_LINK = "/shop?category=Office%20Supplies";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.list("-created_date", 50)
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
    // Fire-and-forget: process abandoned cart recovery emails
    base44.functions.invoke("processCartRecovery").catch(() => {});
  }, []);

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
            <p className="serif-text text-base lg:text-lg">Office Supplies & Stationery — The Seller of the Month</p>
          </div>
          <Link to={OFFICE_SUPPLIES_LINK} className="text-[11px] uppercase tracking-[0.2em] font-semibold hover:text-accent whitespace-nowrap hidden sm:block">Buy Now →</Link>
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
            <ProductRow products={products.slice(0, 5)} />
          </section>

          {/* NEW ARRIVALS */}
          {newArrivals.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 pt-16 lg:pt-24 pb-0">
              <SectionHeader eyebrow="Fresh" title="New Arrivals" link="/shop" />
              <ProductRow products={newArrivals.slice(0, 5)} />
            </section>
          )}

          {/* SEASONAL PICKS */}
          {seasonalPicks.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 border-t hairline pt-6 lg:pt-8 pb-16 lg:pb-24">
              <SectionHeader eyebrow="Limited Time" title="Seasonal Picks" link="/shop?deals=1" />
              <ProductRow products={seasonalPicks.slice(0, 5)} />
            </section>
          )}

          {/* TOP RANKING */}
          {topRated.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Acclaimed" title="Top Ranking" link="/shop" />
              <ProductRow products={topRated.slice(0, 5)} />
            </section>
          )}

          {/* BEST SELLERS */}
          {bestSellers.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Most Wanted" title="Best Sellers" link="/shop" />
              <ProductRow products={bestSellers.slice(0, 5)} />
            </section>
          )}

          {/* FEATURED */}
          {featured.length > 0 && (
            <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
              <SectionHeader eyebrow="Selected" title="Our Featured" link="/shop" />
              <ProductRow products={featured.slice(0, 5)} />
            </section>
          )}

          {/* JUST FOR YOU — full grid */}
          <section className="container-bleed px-5 lg:px-10 border-t hairline pt-6 lg:pt-8 pb-16 lg:pb-24">
            <SectionHeader eyebrow="Personal" title="Just For You" />
            <ProductRow products={products.slice(0, 10)} />
            <div className="text-center mt-12">
              <Link to="/shop" className="btn-mono-outline">Load More</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}