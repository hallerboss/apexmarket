import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Calendar, ArrowRight } from "lucide-react";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Product Updates", "Buying Guides", "News", "Reviews", "Tips & How-To"];

  useEffect(() => {
    base44.entities.BlogPost.filter({ status: "published" }, "-created_date", 50).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="pb-24">
      <div className="container-bleed px-5 lg:px-10 py-10 lg:py-16">
        <h1 className="display-text text-4xl lg:text-5xl mb-2">Blog</h1>
        <p className="text-muted-foreground serif-text text-lg mb-10">Guides, news, and insights to help you shop smarter.</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                activeCategory === c ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-muted-foreground">No articles yet. Check back soon!</p></div>
        ) : (
          <>
            {featured && (
              <Link to={`/blog/${featured.slug}`} className="group block mb-12">
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                  <div className="aspect-[16/10] overflow-hidden bg-secondary">
                    {featured.featured_image && <Image src={featured.featured_image} alt={featured.title} className="w-full h-full" fittingType="fill" />}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">{featured.category}</span>
                    <h2 className="display-text text-2xl lg:text-3xl mt-2 mb-3 group-hover:text-accent transition-colors">{featured.title}</h2>
                    <p className="serif-text text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {featured.published_date ? new Date(featured.published_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                      <span className="mx-1">·</span>
                      {featured.author}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {rest.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group">
                  <div className="aspect-[16/10] overflow-hidden bg-secondary mb-4">
                    {p.featured_image && <Image src={p.featured_image} alt={p.title} className="w-full h-full" fittingType="fill" />}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">{p.category}</span>
                  <h3 className="text-lg font-semibold mt-1 mb-2 group-hover:text-accent transition-colors line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.excerpt}</p>
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {p.published_date ? new Date(p.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}